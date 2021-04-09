type Point = {
  x: number,
  y: number
}

function distanceBetweenPoints(pointA: Point, pointB: Point): number {
  return Math.sqrt(Math.pow(pointB.x -pointA.x, 2) + Math.pow(pointB.y -pointA.y, 2));
}

const canvas = document.createElement("div")

document.body.append(canvas)

function draw() {}
