import { Link } from "react-router";

interface NotFoundProps {
  message: string;
}

export default function NotFound({ message }: NotFoundProps) {
  return (
    <>
      <p>{message}</p>
      <Link to="/art-pieces">Back to gallery</Link>
    </>
  );
}
