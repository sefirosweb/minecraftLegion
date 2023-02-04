import { useEffect, useRef } from "react";

type Props =
  {
    draw: (context: CanvasRenderingContext2D) => void,
    height: number,
    width: number
  }


const Canvas = (props: Props) => {
  const { draw, height, width } = props

  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (context) {
      draw(context);
    }
  });
  return <canvas ref={canvas} height={height} width={width} />;
};


export default Canvas;
