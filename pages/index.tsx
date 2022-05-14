import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from '@mui/material'
import { url } from 'inspector'
import type { NextPage } from 'next'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import Layout from '../src/components/templates/Layout'

interface Inputs {
  delimiter: string,
  body: string
  isBreak: boolean
  maxString: string
}
interface TextObject {
  row: number
  column: number
  text: string
  boxSize: number
}
interface PProTextObject {
  row: number
  column: number
  text: string
  boxSize: number
  track: number
  clip: number
}

const Home: NextPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
  const [columns, setColumns] = useState<number[]>([])
  const [textsWithDelimiters, setTextsWithDelimiters] = useState<string[]>([])
  const [fileURL, setFileURL] = useState('');
  const [textDataJsonURL, setTextDataJsonURL] = useState('');
  const [slicedTextDataJsonURL, setSlicedTextDataJsonURL] = useState('');
  const [joinedText, setJoinedText] = useState('');

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const delimiters = data.delimiter.split(',');

    //改行でテキストを分ける。改行が複数ある場合空白ができるのでその要素は削除
    const textArray = data.body.split('\n').filter(v => v.trim() !== '');
    const columns: number[] = [];
    const maxStrLen = parseInt(data.maxString)
    const breakPointChars = ['、', '。', '？', '?', '！', '!', '」', ')']

    // 文字数が1行あたりの最大文字数を超える場合、2行に分ける。
    for(let i = 0; i < textArray.length; i++) {
      const text = textArray[i].replace(/\s+/g, "");
      const strLen = text.length
      if(strLen > maxStrLen) { //2行に分ける場合、句読点などのキリが良い場所で改行する。
        const halfLength = Math.floor(strLen / 2);
        let breakPointPosition = 0
        let minCharDistanceFromMiddle = 100
        for(let char of breakPointChars) {
          const charPosition = text.indexOf(char)
          const charDistanceFromMiddle = Math.abs(charPosition - halfLength);
          if(charPosition !== -1 && charDistanceFromMiddle < minCharDistanceFromMiddle ) {// バランスを保つため中央に近いところで改行
            minCharDistanceFromMiddle = charDistanceFromMiddle
            breakPointPosition = charPosition + 1
          }
        }
        if(breakPointPosition === 0) { // 句読点などが見つからない場合、半分で改行
          breakPointPosition = halfLength
        }
        const text1 = text.slice(0, breakPointPosition);
        const text2 = text.slice(breakPointPosition);
        textArray[i] = text1 + "\n" + text2
      } else {
        textArray[i] = text
      }
    }

    //テキストデータ生成
    const textObjects: PProTextObject[] = []
    const slicedTextObjects: PProTextObject[][] = []
    const maxBoxSize = 6.5// 最大ボックス数
    let sliceStart = 0;
    let boxSize = 0;
    let currentTrack = 0;
    let currentClips: number[] = [0,0,0,0,0,0,0,0];
    for(let i = 0; i < textArray.length; i++) {
      const text = textArray[i]
      let size = 1
      let textObj: PProTextObject = {} as PProTextObject
      if(text.length > maxStrLen) { //2行時のテロップボックスサイズ
        size = 1.75
      }

      boxSize += size;
      if(boxSize > maxBoxSize) { //最大テロップを超えた場合、トラック0に初期化
        currentTrack = 0;
      }

      const delimiterIndex = getDelimiterIndex(text, delimiters);
      if(delimiterIndex > -1) {
        textObj = {
          row: i,
          column: delimiterIndex,
          text: text.slice(0),
          boxSize: size,
          track: currentTrack,
          clip: currentClips[currentTrack]
        }
        textObjects.push(textObj)
        columns.push(delimiterIndex)
      } else {
        textObj = {
          row: i,
          column: textObjects[textObjects.length - 1].column,
          text: text,
          boxSize: size,
          track: currentTrack,
          clip: currentClips[currentTrack]
        }
        textObjects.push(textObj)
        columns.push(textObjects[textObjects.length - 1].column)
      }

      if (i === textArray.length - 1) {
        slicedTextObjects.push(textObjects.slice(sliceStart, i+1));
      } else if(boxSize > maxBoxSize) { //最大テロップを超えた場合、シーンを分ける
        slicedTextObjects.push(textObjects.slice(sliceStart, i))
        sliceStart = i
        boxSize = size;
      }

      currentClips[currentTrack]++;
      currentTrack++;
    }

    console.log(textObjects)
    console.log(slicedTextObjects)
    setTextsWithDelimiters(textArray);
    setColumns(columns);
    createCSVFile(textObjects)
    setTextDataJsonURL(createJSONFile(textObjects))
    setSlicedTextDataJsonURL(createJSONFile(slicedTextObjects))
    createJoinedText(textArray, delimiters);
  }

  const getDelimiterIndex = (text: string, delimiters: string[]) => {
    for(let i = 0; i < delimiters.length; i++) {
      const delimiter = delimiters[i];
      if(text.indexOf(delimiter) === 0) {
        return i;
      }
    }
    return -1;
  }

  const createCSVFile = (textObjects: TextObject[]) => {
    let csvFile = '';
    let maxColumn = 4
    for(let i = 0; i < textObjects.length; i++) {
      for(let j = 0; j < maxColumn; j++) {
        const obj = textObjects[i]
        if(j === maxColumn - 1) {
          csvFile += (obj.column === j) ? obj.text.trim() + '\n' : '\n';
        } else {
          csvFile += (obj.column === j) ? obj.text.trim() + ',' : ',';
        }
      }
    }
    const blob =new Blob([csvFile],{type:"text/csv"}); 
    const url = URL.createObjectURL(blob);
    setFileURL(url);
  }

  const createJSONFile = (textObjects: any) => {
    const jsonFile = JSON.stringify(textObjects, null, '  ');
    const blob = new Blob([jsonFile], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    return url
  }
  
  const createJoinedText = (texts: string[], delimiters: string[]) => {
    let joinedText = '';
    for(let text of texts) {
      for(let i = 0; i < delimiters.length; i++) {
        const delimiter = delimiters[i];
        if(text.trim().indexOf(delimiter) === 0) {
          joinedText += '\n'
          break;
        }
      }
      joinedText += text + '\n'
    }
    setJoinedText(joinedText); 
  }

  return (
    <Layout>
      <div className='container mx-auto'>
        <h1>Premiere Proの音声ファイルを1つだけ有効にする</h1>
        <div className='mb-4 p-4 border'>
          台本の作成方法
          <ul className='list-disc list-inside py-4'>
            <li>話し手が変わるところで、文章の先頭に「改行」と「区切り文字(a,b,cなど)」を入れる</li>
            <li>
              50文字を超える場合、区切りがいい場所で改行を入れる。<br/>
              Google Documentを使う場合はフォントサイズは「10」、ルーラーの左端を「0」、右端を「17.5」に合わせると、1行が約50文字になる。
            </li>
          </ul>
          「台本の例」<br /><br />
            Aこんにちはゆっくり霊夢です。<br /><br />
            Bゆっくり魔理沙だぜ。今日はPremiere Proの自動編集の方法を紹介していくぜ。<br /><br />
            A自動編集？そんなことができるの？<br />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <TextField 
              label="区切り文字(カンマ(,)で区切る。スペースは空けない)"
              variant="standard" 
              defaultValue="a,・,b,c" 
              className='w-1/3'
              {...register("delimiter", {
                required: '入力してください'
              })}
            />
          </div>
          <div className='mb-4'>
            <TextField 
              label="1行あたりの文字数上限"
              variant="standard" 
              defaultValue={25}
              type="number"
              className='w-1/3'
              inputProps={{ inputMode: 'numeric'}}
              {...register("maxString", {
                required: '入力してください'
              })}
            />
          </div>
          <div className='mb-4'>
            <TextField 
              label="仕分けする文章"
              defaultValue=""
              multiline
              minRows={5}
              maxRows={15}
              fullWidth
              {...register("body", {
                required: '入力してください'
              })}
            />
          </div>
          {/* <div className='mb-4'>
            <FormControlLabel {...register("isBreak", {})} control={<Checkbox />} label="改行を残す" />
          </div> */}
          <div>
            <Button variant='contained' type='submit'>送信</Button>
          </div>
        </form>
        <div className='my-4'>
          <div className='mb-4'>音声トラック番号</div>
          {columns.length > 0 && (
            <div className='overflow-x-auto'>
              [{columns.join(',')}]
            </div>
          )}
        </div>
        <div className='my-4'>
          <div className='mb-4'>台本(識別子あり)</div>
          {textsWithDelimiters.length > 0 && (
            <TextField 
              value={joinedText}
              multiline
              minRows={5}
              maxRows={15}
              fullWidth
            />
          )}
        </div>
        <div className='my-4'>
          {textDataJsonURL && <Button href={textDataJsonURL} download>台本データをjsonファイルで保存</Button>}
        </div>
        <div className='my-4'>
          {slicedTextDataJsonURL && <Button href={slicedTextDataJsonURL} download>仕分けした台本をjsonファイルで保存</Button>}
        </div>
        <div className='my-4'>
          {fileURL && <Button href={fileURL} download>台本をCSVファイルで保存</Button>}
        </div>
      </div>
    </Layout>
  )
}

export default Home
