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
}

const Home: NextPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
  const [columns, setColumns] = useState<number[]>([])
  const [texts, setTexts] = useState<string[]>([])
  const [textsWithDelimiters, setTextsWithDelimiters] = useState<string[]>([])
  const [fileURL, setFileURL] = useState('');
  const [jsonFileURL, setJsonFileURL] = useState('');

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const delimiters = data.delimiter.split(',');

    //改行でテキストを分ける。改行が複数ある場合空白ができるのでその要素は削除
    const textArray = data.body.split('\n').filter(v => v.trim() !== '');
    const columns: number[] = [];
    const textObjects: TextObject[] = []

    //文字数上限のチェック。（本当はこの後のmapと同時にやりたいけど今は応急処置）
    const maxString = parseInt(data.maxString)
    for(let i = 0; i < textArray.length; i++) {
      const text = textArray[i]
      if(textArray[i].length > maxString) {//上限を超えるなら要素を分ける
        let texts = []
        const maxString = parseInt(data.maxString);
        for(let j = 0; j < text.length; j += maxString) {//最大文字数で分割
          texts.push(text.substring(j, j + maxString))
        }
        for(let k = 0; k < texts.length; k++) {//分割した要素を格納
          if (k == 0) textArray.splice(i + k, 1, texts[k])
          else textArray.splice(i + k, 0, texts[k])
        }
      }
    }
    const texts = textArray.map(text => {
      for(let i = 0; i < delimiters.length; i++) {
        const delimiter = delimiters[i]
        if(text.trim().indexOf(delimiter) === 0) {// 区切り文字によってcolumnとrowの情報を持ったオブジェクトに変換
            columns.push(i)
            textObjects.push({
              row: textObjects.length,
              column: i,
              text: text.slice(1)
            })
            return text.slice(1)
        }
      }
      columns.push(columns[columns.length - 1]);
      textObjects.push({
        row: textObjects.length,
        column: columns[columns.length - 1],
        text: text
      })
      return text
    })
    console.log(textObjects)
    setTexts(texts)
    setTextsWithDelimiters(textArray);
    setColumns(columns);
    createCSVFile(textObjects)
    createJSONFile(textObjects)
  }

  const createCSVFile = (textObjects: TextObject[]) => {
    let csvFile = '';
    let maxColumn = 4
    for(let i = 0; i < textObjects.length; i++) {
      for(let j = 0; j < maxColumn; j++) {
        const obj = textObjects[i]
        if(j === maxColumn - 1) {
          csvFile += (obj.column === j) ? obj.text + '\n' : '\n';
        } else {
          csvFile += (obj.column === j) ? obj.text + ',' : ',';
        }
      }
    }
    const blob =new Blob([csvFile],{type:"text/csv"}); 
    const url = URL.createObjectURL(blob);
    setFileURL(url);
  }
  const createJSONFile = (textObjects: TextObject[]) => {
    const jsonFile = JSON.stringify(textObjects, null, '  ');
    const blob = new Blob([jsonFile], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    setJsonFileURL(url);
  }
  return (
    <Layout>
      <div className='container mx-auto'>
        <h1>Premiere Proの音声ファイルを1つだけ有効にする</h1>
        <div className='mb-4 p-4 border'>
          台本の作成方法
          <ul className='list-disc list-inside py-4'>
            <li>話し手が変わるところで、文章の先頭に「改行」と「区切り文字(a,b,cなど)」を入れる</li>
            <li>話し手が変わるまでは改行をしない</li>
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
              label="1箱の文字数の上限"
              variant="standard" 
              defaultValue={30}
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
          <div className='mb-4'>台本</div>
          {texts.length > 0 && (
            <TextField 
              value={texts.join('\n')}
              multiline
              minRows={5}
              maxRows={15}
              fullWidth
            />
          )}
        </div>
        <div className='my-4'>
          <div className='mb-4'>台本(識別子あり)</div>
          {textsWithDelimiters.length > 0 && (
            <TextField 
              value={textsWithDelimiters.join('\n')}
              multiline
              minRows={5}
              maxRows={15}
              fullWidth
            />
          )}
        </div>
        <div className='my-4'>
          {jsonFileURL && <Button href={jsonFileURL} download>台本をjsonファイルで保存</Button>}
        </div>
        <div className='my-4'>
          {fileURL && <Button href={fileURL} download>台本をCSVファイルで保存</Button>}
        </div>
      </div>
    </Layout>
  )
}

export default Home
