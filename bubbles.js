// Bubble interaction effect
class BubbleField {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.width = document.documentElement.clientWidth;
    this.height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = '100%';
    this.canvas.style.height = `${this.height}px`;

    this.isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth <= 720;
    this.bubbles = [];
    this.cursor = { x: 0, y: 0 };
    this.enabled = !this.isMobile;
    this.attractionRadius = 200;
    this.attractionStrength = 0.08;
    this.meterValue = 0;
    this.totalBubbleArea = 0;
    this.capturedBubbleArea = 0;
    this.animationTime = 0;
    this.meterFill = document.getElementById('bubble-meter-fill');
    this.meterValueLabel = document.getElementById('bubble-meter-value');
    this.meterRect = null;

    this.initBubbles();
    this.attachEventListeners();
    this.updateDeviceMode();
    this.updateMeterRect();
    this.animate();
  }

  toggle() {
    this.enabled = !this.enabled;
    this.canvas.style.display = this.enabled ? 'block' : 'none';
    const toggleButton = document.getElementById('bubble-toggle');
    if (toggleButton) {
      const icon = toggleButton.querySelector('i');
      const label = toggleButton.querySelector('.sr-only');
      toggleButton.classList.toggle('active', this.enabled);
      toggleButton.setAttribute('aria-pressed', String(this.enabled));
      toggleButton.setAttribute('aria-label', this.enabled ? 'Burbujas activas' : 'Burbujas desactivadas');
      if (icon) {
        icon.className = this.enabled ? 'fa-solid fa-droplet' : 'fa-solid fa-droplet-slash';
      }
      if (label) {
        label.textContent = this.enabled ? 'Burbujas activas' : 'Burbujas desactivadas';
      }
    }
  }

  initBubbles() {
    const bubbleCount = 50;
    this.totalBubbleArea = 0;
    for (let i = 0; i < bubbleCount; i++) {
      const radius = Math.random() * 3 + 2;
      const speedFactor = Math.max(0.6, 1.4 - (radius - 2) * 0.18);
      const area = Math.PI * radius * radius;
      this.totalBubbleArea += area;
      this.bubbles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 2 * speedFactor,
        vy: (Math.random() - 0.5) * 2 * speedFactor - 0.5 * speedFactor,
        area,
        radius,
        opacity: Math.random() * 0.6 + 0.2,
        speedFactor,
        phase: Math.random() * Math.PI * 2,
        deformPhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.011 + Math.random() * 0.01,
        deformSpeed: 0.008 + Math.random() * 0.01,
        deform: 1,
      });
    }
  }

  mergeBubbles(bubbleA, bubbleB) {
    const areaA = bubbleA.area;
    const areaB = bubbleB.area;
    const totalArea = areaA + areaB;
    const mergedRadius = Math.sqrt(totalArea / Math.PI);
    const weightA = areaA / totalArea;
    const weightB = areaB / totalArea;
    return {
      x: bubbleA.x * weightA + bubbleB.x * weightB,
      y: bubbleA.y * weightA + bubbleB.y * weightB,
      vx: (bubbleA.vx * areaA + bubbleB.vx * areaB) / totalArea,
      vy: (bubbleA.vy * areaA + bubbleB.vy * areaB) / totalArea,
      area: totalArea,
      radius: mergedRadius,
      opacity: Math.max(bubbleA.opacity, bubbleB.opacity),
      speedFactor: Math.max(0.5, 1.4 - (mergedRadius - 2) * 0.18),
      phase: bubbleA.phase * weightA + bubbleB.phase * weightB,
      deformPhase: bubbleA.deformPhase * weightA + bubbleB.deformPhase * weightB,
      wobbleSpeed: bubbleA.wobbleSpeed * weightA + bubbleB.wobbleSpeed * weightB,
      deformSpeed: bubbleA.deformSpeed * weightA + bubbleB.deformSpeed * weightB,
      deform: (bubbleA.deform || 1) * weightA + (bubbleB.deform || 1) * weightB,
    };
  }

  splitBubble(bubble) {
    const smallArea = bubble.area * 0.45;
    const largeArea = bubble.area - smallArea;
    const direction = Math.atan2(bubble.vy, bubble.vx) || 0;
    const offset = bubble.radius * 0.8;
    const splitVelocity = Math.max(1.2, Math.hypot(bubble.vx, bubble.vy) * 0.7);
    return [
      {
        x: bubble.x - Math.cos(direction) * offset,
        y: bubble.y - Math.sin(direction) * offset,
        vx: bubble.vx - Math.cos(direction) * splitVelocity * 0.4,
        vy: bubble.vy - Math.sin(direction) * splitVelocity * 0.4,
        area: smallArea,
        radius: Math.sqrt(smallArea / Math.PI),
        opacity: bubble.opacity,
        speedFactor: bubble.speedFactor,
        phase: bubble.phase + 0.5,
        deformPhase: bubble.deformPhase + 0.5,
        wobbleSpeed: bubble.wobbleSpeed,
        deformSpeed: bubble.deformSpeed,
        deform: bubble.deform * 0.8,
      },
      {
        x: bubble.x + Math.cos(direction) * offset,
        y: bubble.y + Math.sin(direction) * offset,
        vx: bubble.vx + Math.cos(direction) * splitVelocity * 0.4,
        vy: bubble.vy + Math.sin(direction) * splitVelocity * 0.4,
        area: largeArea,
        radius: Math.sqrt(largeArea / Math.PI),
        opacity: bubble.opacity,
        speedFactor: bubble.speedFactor,
        phase: bubble.phase - 0.5,
        deformPhase: bubble.deformPhase - 0.5,
        wobbleSpeed: bubble.wobbleSpeed,
        deformSpeed: bubble.deformSpeed,
        deform: bubble.deform * 0.9,
      },
    ];
  }

  resolveBubbleMerges() {
    for (let i = 0; i < this.bubbles.length; i++) {
      let bubbleA = this.bubbles[i];
      for (let j = i + 1; j < this.bubbles.length; j++) {
        const bubbleB = this.bubbles[j];
        const dx = bubbleB.x - bubbleA.x;
        const dy = bubbleB.y - bubbleA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlapThreshold = bubbleA.radius + bubbleB.radius + Math.max(2, Math.max(bubbleA.radius, bubbleB.radius) * 0.4);
        if (distance <= overlapThreshold) {
          bubbleA = this.mergeBubbles(bubbleA, bubbleB);
          this.bubbles[i] = bubbleA;
          this.bubbles.splice(j, 1);
          j--;
        }
      }
    }
  }

  attachEventListeners() {
    window.addEventListener('mousemove', (e) => {
      this.cursor.x = e.clientX + window.pageXOffset;
      this.cursor.y = e.clientY + window.pageYOffset;
    });

    const toggleButton = document.getElementById('bubble-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        if (!this.isMobile) this.toggle();
      });
    }

    window.addEventListener('resize', () => {
      this.width = document.documentElement.clientWidth;
      this.height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.width = '100%';
      this.canvas.style.height = `${this.height}px`;
      this.updateDeviceMode();
      this.updateMeterRect();
    });

    window.addEventListener('scroll', () => this.updateMeterRect());
  }

  updateMeterRect() {
    const meter = document.getElementById('bubble-meter');
    if (meter) {
      const rect = meter.getBoundingClientRect();
      this.meterRect = {
        x: rect.left + window.pageXOffset,
        y: rect.top + window.pageYOffset,
        width: rect.width,
        height: rect.height,
      };
    }
  }

  updateDeviceMode() {
    const wasMobile = this.isMobile;
    this.isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth <= 720;
    if (this.isMobile !== wasMobile) {
      this.enabled = !this.isMobile;
      this.canvas.style.display = this.enabled ? 'block' : 'none';
      if (!this.enabled && this.meterFill) {
        this.meterFill.style.width = '0%';
      }
      if (!this.enabled && this.meterValueLabel) {
        this.meterValueLabel.textContent = '0%';
      }
      if (!this.enabled) {
        this.capturedBubbleArea = 0;
        this.meterValue = 0;
      }
    }
  }

  collectBubble(index) {
    const bubble = this.bubbles[index];
    const bubbleArea = bubble.area;
    this.bubbles.splice(index, 1);
    this.capturedBubbleArea += bubbleArea;
    this.meterValue = this.totalBubbleArea > 0
      ? Math.min(100, (this.capturedBubbleArea / this.totalBubbleArea) * 100)
      : 0;
    if (this.meterFill) {
      this.meterFill.style.width = `${this.meterValue}%`;
    }
    if (this.meterValueLabel) {
      this.meterValueLabel.textContent = `${Math.round(this.meterValue)}%`;
    }
  }

  updateBubbles() {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];
      // Natural drift with size-dependent friction
      const drag = 0.98 - (bubble.speedFactor - 1) * 0.03;
      bubble.vx *= drag;
      bubble.vy *= drag;

      // Attraction to cursor always, scaled by bubble size
      const dx = this.cursor.x - bubble.x;
      const dy = this.cursor.y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let interaction = 0;
      if (distance < this.attractionRadius && distance > 0) {
        const force = (1 - distance / this.attractionRadius) * this.attractionStrength * bubble.speedFactor * 1.05;
        interaction = force;
        bubble.vx += (dx / distance) * force;
        bubble.vy += (dy / distance) * force;
      }

      const speed = Math.hypot(bubble.vx, bubble.vy);
      const targetDeform = 1 + Math.min(1.4, speed * 0.28 + interaction * 0.95);
      bubble.deform = bubble.deform * 0.88 + targetDeform * 0.12;

      bubble.phase += bubble.wobbleSpeed;
      bubble.deformPhase += bubble.deformSpeed;

      // Update position
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;

      // Split when the droplet is pulled hard enough and still has volume
      if (bubble.deform > 2.2 && bubble.area > Math.PI * 12) {
        const [smallBubble, largeBubble] = this.splitBubble(bubble);
        this.bubbles.splice(i, 1, smallBubble, largeBubble);
        continue;
      }

      // Bubble collection in meter area
      if (this.meterRect) {
        const insideX = bubble.x > this.meterRect.x && bubble.x < this.meterRect.x + this.meterRect.width;
        const insideY = bubble.y > this.meterRect.y && bubble.y < this.meterRect.y + this.meterRect.height;
        if (insideX && insideY) {
          this.collectBubble(i);
          continue;
        }
      }

      // Bounds
      const radius = bubble.radius || Math.sqrt(bubble.area / Math.PI);
      if (bubble.x - radius < 0 || bubble.x + radius > this.width) {
        bubble.vx *= -0.62;
        bubble.vy *= 0.92;
        bubble.x = Math.max(radius, Math.min(this.width - radius, bubble.x));
      }

      if (bubble.y - radius < 0 || bubble.y + radius > this.height) {
        bubble.vy *= -0.62;
        bubble.vx *= 0.92;
        bubble.y = Math.max(radius, Math.min(this.height - radius, bubble.y));
      }
    }

    this.resolveBubbleMerges();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.bubbles.forEach((bubble) => {
      const points = 40;
      const speed = Math.hypot(bubble.vx, bubble.vy);
      const motion = Math.max(1, Math.min(2.4, bubble.deform));
      const direction = speed > 0.01 ? Math.atan2(bubble.vy, bubble.vx) : 0;
      const stretch = 1 + (motion - 1) * 0.9;
      const squash = 1 / stretch;
      const wobble = bubble.radius * (0.02 + (motion - 1) * 0.18);
      const phase = bubble.phase + this.animationTime * bubble.wobbleSpeed;
      const deformPhase = bubble.deformPhase + this.animationTime * bubble.deformSpeed;
      const shape = [];

      for (let p = 0; p < points; p++) {
        const angle = (Math.PI * 2 * p) / points;
        const theta = angle - direction;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const baseRadius = bubble.radius / Math.sqrt((cosT * cosT) / (stretch * stretch) + (sinT * sinT) / (squash * squash));
        const radialWobble = Math.sin(angle * 5 + phase) * wobble * 0.5 + Math.sin(angle * 3 - deformPhase) * wobble * 0.34;
        const r = Math.max(bubble.radius * 0.7, baseRadius + radialWobble);
        shape.push({ x: bubble.x + Math.cos(angle) * r, y: bubble.y + Math.sin(angle) * r });
      }

      this.ctx.fillStyle = `rgba(15, 92, 145, ${bubble.opacity * 0.12})`;
      this.ctx.beginPath();
      const firstPoint = shape[0];
      this.ctx.moveTo(firstPoint.x, firstPoint.y);
      for (let k = 1; k <= shape.length; k++) {
        const current = shape[k % shape.length];
        const previous = shape[k - 1];
        const midX = (previous.x + current.x) / 2;
        const midY = (previous.y + current.y) / 2;
        this.ctx.quadraticCurveTo(previous.x, previous.y, midX, midY);
      }
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.strokeStyle = `rgba(15, 92, 145, ${bubble.opacity * 0.28})`;
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();
    });
  }

  animate() {
    if (this.enabled) {
      this.animationTime += 0.035;
      this.updateBubbles();
      this.draw();
    }
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BubbleField();
  });
} else {
  new BubbleField();
}
