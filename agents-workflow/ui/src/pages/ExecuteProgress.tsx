import { useParams } from "react-router-dom";

export function ExecuteProgress() {
  const { planId } = useParams<{ planId: string }>();
  return (
    <div>
      <h1>执行进度</h1>
      <p>计划 ID: {planId}</p>
    </div>
  );
}
