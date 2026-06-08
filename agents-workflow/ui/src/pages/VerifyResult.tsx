import { useParams } from "react-router-dom";

export function VerifyResult() {
  const { planId } = useParams<{ planId: string }>();
  return (
    <div>
      <h1>验证结果</h1>
      <p>计划 ID: {planId}</p>
    </div>
  );
}
