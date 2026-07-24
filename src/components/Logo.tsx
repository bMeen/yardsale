import { Link } from "react-router";

function Logo({ className }: { className?: string }) {
  return (
    <Link to="/">
      <p
        className={`font-logo text-primary text-3xl tracking-widest uppercase ${className}`}
      >
        yardsale
      </p>
    </Link>
  );
}

export default Logo;
