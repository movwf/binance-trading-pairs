export default function clsx(...args) {
  return args
    .map((str) => str.trimStart().trimEnd())
    .filter(Boolean)
    .join(" ");
}
