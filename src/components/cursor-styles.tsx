const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const url = (name: string) => `url("${basePath}/cursors/${name}.png")`;

const css = `:root {
  --cursor-default: ${url("cursor")} 2 2, auto;
  --cursor-pointer: ${url("hand-pointer")} 8 4, pointer;
  --cursor-text: ${url("text-cursor")} 16 16, text;
  --cursor-move: ${url("move")} 16 16, move;
  --cursor-grab: ${url("grab")} 12 12, grab;
  --cursor-grabbing: ${url("grab")} 12 12, grabbing;
}`;

export function CursorStyles() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
