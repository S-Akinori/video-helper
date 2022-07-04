import Head from "next/head"
import React, { CSSProperties } from "react"
import Footer from "../../organisms/Footer"
import Header from "../../organisms/Header"

interface Props {
  children: React.ReactNode
  pageTitle?: string,
  pageDescription?: string
  pagePath?: string
  pageImg?: string
  className?: string
  style? : CSSProperties
}

const Layout = ({
    children,
    className = '',
    style = undefined
  }: Props) => {
  return (
    <div style={{overflowX: 'hidden'}}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>動画編集アプリ</title>
        {/* {process.env.NEXT_PUBLIC_ENV !== 'production' && <meta name="robots" content="noindex, nofollow" />} */}
        <meta name="description" content="動画編集を手助けするアプリです。" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
        <meta property="og:title" content="動画編集アプリ" />
        <meta property="og:description" content="動画編集を手助けするアプリです。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/" />
        {/* <meta property="og:image" content={pageImg} /> */}
        <meta property="og:site_name" content="動画編集アプリ" />
        <meta property="og:locale" content="ja_JP"  />
      </Head>
      <Header />
      <main>
        <div className={`py-16 px-4 ${className}`} style={style}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Layout