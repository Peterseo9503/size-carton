import { supabase } from "@/app/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("product_info")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch {
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      {
        status: 500,
      }
    );
  }
}
