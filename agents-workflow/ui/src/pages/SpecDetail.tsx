import { useParams } from "react-router-dom";

export function SpecDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h1>规格详情</h1>
      <p>ID: {id}</p>
    </div>
  );
}
