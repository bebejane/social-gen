
import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';
import fontFiles from '/fonts.json'
import * as templates from '/templates'

export default async function handler(req: NextRequest, res: NextResponse) {

  try {

    let params: any = {}
    const fonts = await Promise.all(fontFiles.map(({ name }) => generateFont({ name })))
    const name = req.nextUrl.searchParams.get('template').toLowerCase()


    if (req.nextUrl.searchParams.get('params'))
      params = JSON.parse(req.nextUrl.searchParams.get('params'))

    const Component = templates[Object.keys(templates).find(k => k.toLocaleLowerCase() === name)]
    const template = require(`/templates/${name}/index.json`);
    const config = require(`/templates/${name}/config.json`);

    Object.keys(template).forEach((k) => params[k] = {
      ...template[k],
      ...params[k]
    })

    return new ImageResponse(<Component {...params} />, { ...config.dimensions, fonts })

  } catch (err) {


    return new ImageResponse(
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        color: "red"
      }}>
        <h1>Error!</h1>
        {err.message}
      </div>,
      { width: 600, height: 400 }
    )
  }
}

const defaultConfig = {
  "dimensions": {
    "width": 800,
    "height": 500
  }
}

export type FontOption = {
  name: string,
  data: ArrayBuffer,
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
  style?: 'normal' | 'italic'
}

const generateFont = async (opt: Omit<FontOption, 'data'>): Promise<FontOption> => {

  return {
    data: await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/fonts/${opt.name}.woff`).then(res => res.arrayBuffer()),
    ...opt
  }
}


export const config = {
  runtime: 'experimental-edge',
};