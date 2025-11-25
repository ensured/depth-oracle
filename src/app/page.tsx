import ClientWrapper from "@/components/ClientWrapper";
import { getSupabaseInstance } from "@/lib/supabaseSingletonServer";
// import { auth } from "@clerk/nextjs/server";
export default async function Home() {
  const supabase = await getSupabaseInstance()
  const { data, error } = await supabase.from("token_usage").select("*").limit(1);
  if (!error) console.log(data)
  console.log(error)

  // // give all new users a free pro plan (change)
  // const { userId } = await auth()
  // const { data: tableData, error: tableError } = await supabase.from("token_usage").insert({
  //   credits_used: 0.1,
  //   plan: "pro",
  //   reset_date: new Date(),
  //   updated_at: new Date(),
  // }).eq("user_id", userId);
  // if (!tableError) console.log(tableData)


  return <ClientWrapper />;
}
