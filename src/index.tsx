import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

type Point = {
  x: number;
  y: number;
};

type Crank = {
  x: number;
  y: number;
  length: number;
  angle: number;
};

type FixedLink = {
  x: number;
  y: number;
  length: number;
};

type Link = {
  length: number;
};

function rpmToRadiansPerSecond(rpm: number) {
  return (rpm * 2 * Math.PI) / 60;
}

function distanceBetweenPoints(pointA: Point, pointB: Point): number {
  return Math.sqrt(
    Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)
  );
}

type RangeProps = {
  value: number;
  onChange: (newValue: number) => void;
};

const Range: React.FC<RangeProps> = ({ value, onChange }) => {
  return (
    <div>
      <input
        type="range"
        value={value}
        min="1"
        max="60"
        onChange={(e) => {
          console.log(parseInt(e.target.value));
          onChange(parseInt(e.target.value));
        }}
      />
    </div>
  );
};

const FIXED_LINK: FixedLink = {
  x: 100,
  y: 20,
  length: 200,
};

const CRANK: Crank = {
  x: -100,
  y: -100,
  angle: 0,
  length: 120,
};

const CONNECTING_LINK: Link = {
  length: 170,
};

function drawLine(ctx: CanvasRenderingContext2D, pointA: Point, pointB: Point) {
  const canvas = ctx.canvas;
  ctx.beginPath();
  ctx.fillStyle = "#fff";
  ctx.moveTo(pointA.x + canvas.width / 2, pointA.y * -1 + canvas.height / 2);
  ctx.lineTo(pointB.x + canvas.width / 2, pointB.y * -1 + canvas.height / 2);
  ctx.closePath();
  ctx.stroke();
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  radius: number,
  point: Point
) {
  const canvas = ctx.canvas;
  ctx.beginPath();
  ctx.fillStyle = "#fff";
  ctx.arc(
    point.x + canvas.width / 2,
    point.y * -1 + canvas.height / 2,
    radius,
    0,
    Math.PI * 2,
    true
  );
  ctx.closePath();
  ctx.stroke();
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastTime, setLastTime] = useState(() => Date.now());
  const [crank, setCrank] = useState(() => CRANK);
  const [rpm, setRpm] = useState(15);

  const draw = useCallback(() => {
    console.log(rpm);
    const canvas = canvasRef.current;

    if (!canvas) {
      window.requestAnimationFrame(draw);
      return;
    }
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      window.requestAnimationFrame(draw);
      return;
    }

    const now = Date.now();

    // Resize canvas to match size of body
    const bodySize = document.body.getBoundingClientRect();
    canvas.width = bodySize.width;
    canvas.height = bodySize.height;
    canvas.style.width = `${bodySize.width}px`;
    canvas.style.height = `${bodySize.height}px`;

    // Draw X axis
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.closePath();
    ctx.stroke();

    // Draw Y axis
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.closePath();
    ctx.stroke();

    const newOffsetAngle =
      (-1 *
        (crank.angle +
          ((now - lastTime) / 1000) * rpmToRadiansPerSecond(rpm))) %
      (2 * Math.PI);

    const crankX = crank.x + Math.cos(newOffsetAngle) * crank.length;
    const crankY = crank.y + Math.sin(newOffsetAngle) * crank.length;

    drawCircle(ctx, crank.length, { x: crank.x, y: crank.y });

    drawCircle(ctx, FIXED_LINK.length, {
      x: FIXED_LINK.x,
      y: FIXED_LINK.y,
    });

    drawCircle(ctx, CONNECTING_LINK.length, {
      x: crankX,
      y: crankY,
    });

    // Draw the crank
    drawLine(ctx, { x: crank.x, y: crank.y }, { x: crankX, y: crankY });
    drawCircle(ctx, 3, { x: crank.x, y: crank.y });
    drawCircle(ctx, 3, { x: crankX, y: crankY });

    // Draw line from end of crank to center of fixed crank
    drawLine(
      ctx,
      { x: crankX, y: crankY },
      { x: FIXED_LINK.x, y: FIXED_LINK.y }
    );

    const tiltAngle = Math.atan2(crankY - FIXED_LINK.y, crankX - FIXED_LINK.x);

    ctx.fillText(`${(tiltAngle * 180) / Math.PI}`, 50, 50);

    drawLine(
      ctx,
      {
        x: FIXED_LINK.x + Math.cos(tiltAngle) * FIXED_LINK.length,
        y: FIXED_LINK.y + Math.sin(tiltAngle) * FIXED_LINK.length,
      },
      { x: FIXED_LINK.x, y: FIXED_LINK.y }
    );

    // console.log(
    //   distanceBetweenPoints(
    //     { x: crankX, y: crankY },
    //     { x: FIXED_LINK.x, y: FIXED_LINK.y }
    //   )
    // );

    const distanceBetweenCrankEndAndFixedLinkCenterPoint = distanceBetweenPoints(
      { x: crankX, y: crankY },
      { x: FIXED_LINK.x, y: FIXED_LINK.y }
    );

    const otherAngle = Math.asin(
      (Math.pow(FIXED_LINK.length, 2) +
        Math.pow(CONNECTING_LINK.length, 2) -
        Math.pow(distanceBetweenCrankEndAndFixedLinkCenterPoint, 2)) /
        (2 * FIXED_LINK.length * CONNECTING_LINK.length)
    );

    ctx.fillText(`${(otherAngle * 180) / Math.PI}`, 50, 100);

    drawLine(
      ctx,
      {
        x: crankX + Math.cos(otherAngle - tiltAngle) * CONNECTING_LINK.length,
        y: crankY + Math.sin(otherAngle - tiltAngle) * CONNECTING_LINK.length,
      },
      { x: crankX, y: crankY }
    );

    setCrank({
      ...crank,
      angle: newOffsetAngle,
    });

    setLastTime(now);

    window.requestAnimationFrame(draw);
  }, [lastTime, crank, rpm]);

  useEffect(() => {
    window.requestAnimationFrame(draw);
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} />
      <Range
        value={rpm}
        onChange={(newValue) => {
          setRpm(newValue);
        }}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
