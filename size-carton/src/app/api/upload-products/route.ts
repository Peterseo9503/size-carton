import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: Request) {
  const { products } = await req.json();

  try {
    // 1. 기존 데이터 모두 삭제
    const { error: deleteError } = await supabase
      .from("product_info")
      .delete()
      .neq("id", 0); // id가 0이 아닌 모든 데이터 삭제 (실질적으로 모든 데이터)

    if (deleteError) {
      return new Response(
        JSON.stringify({
          error: `기존 데이터 삭제 실패: ${deleteError.message}`,
        }),
        {
          status: 500,
        }
      );
    }

    // 2. 새로운 데이터 삽입
    const { data, error: insertError } = await supabase
      .from("product_info")
      .insert(products);

    if (insertError) {
      return new Response(
        JSON.stringify({
          error: `새 데이터 삽입 실패: ${insertError.message}`,
        }),
        {
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({
        data,
        message: `기존 데이터를 삭제하고 ${products.length}개의 새로운 제품을 등록했습니다.`,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `서버 오류: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`,
      }),
      {
        status: 500,
      }
    );
  }
}
