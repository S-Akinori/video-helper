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
  const [textObjects, setTextObjects] = useState<TextObject[]>([])
  const [fileURL, setFileURL] = useState('');
  const [jsonFileURL, setJsonFileURL] = useState('');
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const delimiters = data.delimiter.split(',');

    //改行でテキストを分ける。改行が複数ある場合空白ができるのでその要素は削除
    const textArray = data.body.split('\n').filter(v => v.trim() !== '');

    const columns: number[] = [];
    const textObjects: TextObject[] = []
    const texts = textArray.map(text => {
      for(let i = 0; i < delimiters.length; i++) {
        const delimiter = delimiters[i]
        if(text.trim().indexOf(delimiter) === 0) {
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
    setTexts(texts)
    setColumns(columns);
    setTextObjects(textObjects)
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
    console.log(jsonFile)
    console.log(blob)
    console.log(url)
    setJsonFileURL(url);
  }
  return (
    <Layout>
      <div className='container mx-auto'>
        <h1>Premiere Proの音声ファイルを1つだけ有効にする</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <TextField 
              label="区切り文字(カンマ(,)で区切る。スペースは空けない)"
              variant="standard" 
              defaultValue="a,・,b,c" 
              {...register("delimiter", {
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
          <div className='mb-4'>
            <FormControlLabel {...register("isBreak", {})} control={<Checkbox />} label="改行を残す" />
          </div>
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
          <div className='mb-4'>台本(カンマ区切り)</div>
          {texts.length > 0 && (
            <div className='h-40 overflow-y-scroll'>
              {texts.join(',')}
            </div>
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
