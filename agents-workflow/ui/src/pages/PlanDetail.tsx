import { useParams } from "react-router-dom";

export function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h1>计划 DAG</h1>
      <p>ID: {id}</p>
    </div>
  );
}
