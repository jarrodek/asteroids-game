export class Vector {
  constructor(public x: number, public y: number) {}

  public add(vector: Vector): void {
    this.x += vector.x;
    this.y += vector.y;
  }

  public subtract(vector: Vector): void {
    this.x -= vector.x;
    this.y -= vector.y;
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }

  move(angle: number, velocity: number): void {
    this.x += Math.cos(angle) * velocity;
    this.y += Math.sin(angle) * velocity;
  }

  distanceTo(other: Vector): number {
    return Math.floor(Math.sqrt(Math.abs(other.x - this.x) ** 2 + Math.abs(other.y - this.y) ** 2));
  }

  inCircumference(point: Vector, radius: number): boolean {
    const distance = this.distanceTo(point);
    return distance <= radius;
  }

  isCircleCircleCollision(other: Vector, selfRadius: number, otherRadius: number): boolean {
    const distanceSquared = (this.x - other.x)**2 + (this.y - other.y)**2;
    const radiusSumSquared = (selfRadius + otherRadius)**2;
    return distanceSquared <= radiusSumSquared;
  }
}
