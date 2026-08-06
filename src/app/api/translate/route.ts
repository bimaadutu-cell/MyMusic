import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ translated: "" });
    
    // Using free Google Translate API proxy
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    
    let translated = "";
    if (data && data[0]) {
      translated = data[0].map((item: any) => item[0]).join("");
    }
    
    return NextResponse.json({ translated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ translated: "Gagal menerjemahkan lirik." });
  }
}
