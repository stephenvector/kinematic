import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

type Point = {
  x: number;
  y: number;
};

type Circle = {
  center: Point;
  radius: number;
};

type Crank = {
  x: number;
  y: number;
  length: number;
  angle: number;
  rpm: number;
};

//   const circleOne = {
//     x: 0,
//     y: 0,
//     radius: 40,
//   };

//   const circleTwo = {
//     x: 90,
//     y: -30,
//     radius: 60,
//   };

function rpmToRadiansPerSecond(rpm: number) {
  return (rpm * 2 * Math.PI) / 60;
}

function distanceBetweenPoints(pointA: Point, pointB: Point): number {
  return Math.sqrt(
    Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)
  );
}

const RPM = 10;
const RADIANS_PER_SECOND = rpmToRadiansPerSecond(RPM);
const CYCLE_TIME = (60 * 1000) / RPM; // In milliseconds

const circleOne: Circle = {
  center: {
    x: 0,
    y: 0,
  },
  radius: 40,
};

const circleTwo: Circle = {
  center: {
    x: 90,
    y: -30,
  },
  radius: 60,
};

const circles: Circle[] = [circleOne, circleTwo];

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastTime, setLastTime] = useState(() => Date.now());

  const [cranks, setCranks] = useState<Crank[]>([
    {
      x: -200,
      y: -100,
      angle: 0,
      length: 134,
      rpm: 10,
    },
  ]);

  const draw = useCallback(() => {
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

    const pX = canvas.width / 2;
    const pY = canvas.height / 2;

    ctx.lineWidth = 0.4;
    ctx.imageSmoothingEnabled = true;

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

    circles.forEach((circle) => {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,1)";

      ctx.arc(
        circle.center.x + pX,
        circle.center.y + pY,
        circle.radius,
        0,
        Math.PI * 2,
        true
      );
      ctx.closePath();
      ctx.stroke();
    });

    const updatedCranks = cranks.map((crank) => {
      const radiansPerSecond = rpmToRadiansPerSecond(crank.rpm);
      const newOffsetAngle =
        (crank.angle + ((now - lastTime) / 1000) * radiansPerSecond) %
        (2 * Math.PI);

      const crankX = crank.x + Math.cos(newOffsetAngle) * crank.length;
      const crankY = crank.y + Math.sin(newOffsetAngle) * crank.length;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,1)";
      ctx.moveTo(pX + crank.x, pY + crank.y);
      ctx.lineTo(pX + crankX, pY + crankY);
      ctx.closePath();
      ctx.stroke();

      return {
        ...crank,
        angle: newOffsetAngle,
      };
    });

    setCranks(updatedCranks);

    setLastTime(now);

    window.requestAnimationFrame(draw);
  }, [lastTime]);

  useEffect(() => {
    window.requestAnimationFrame(draw);
  }, []);

  return <canvas ref={canvasRef} />;
};

ReactDOM.render(<App />, document.getElementById("root"));
