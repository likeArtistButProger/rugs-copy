// MovingBarChart.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Application, useApplication, extend } from '@pixi/react';
import { Graphics, Container } from 'pixi.js';
import { Ease } from 'pixi-ease';

// register pixi components
extend({ Graphics, Container });

type MovingBarChartProps = {
  getNextX: () => Promise<number>;
};

export const MovingBarChart: React.FC<MovingBarChartProps> = () => {
  const { app } = useApplication();
  const barRef = React.useRef<Graphics>(null);
  const [currentX, setCurrentX] = useState(1);
  const [targetX, setTargetX] = useState<number | null>(null);
  const [barColor, setBarColor] = useState(0x00aa00);
  const [ready, setReady] = useState(true);

  const getNextX = useCallback(() => {
    return Math.random()
  }, []);

  // fetch new target every 250 ms when ready
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const fetchLoop = async () => {
      while (ready && !cancelled) {
        console.log("Loop running");
        const x = await getNextX();
        console.log("New x:", x);
        if (!cancelled) {
          setTargetX(x);
          setReady(false);
          break;
        }
      }
    };
    fetchLoop();
    return () => { cancelled = true; };
  }, [ready, getNextX]);

  // animate bar when targetX updates
  useEffect(() => {
    if (targetX == null || targetX === currentX) return;
    const easing = new Ease({ ticker: app.ticker });
    const directionUp = targetX > currentX;
    setBarColor(directionUp ? 0x00aa00 : 0xaa0000);

    if (barRef.current) {
      easing.add(
        barRef.current,
        { height: targetX * 100 },
        { duration: 500, ease: 'easeInOutQuad' }
      );
    }

    easing.once('complete', () => {
      setCurrentX(targetX!);
      setTimeout(() => setReady(true), 2000 + Math.random() * 3000);
    });

    return () => easing.removeAll();
  }, [targetX, currentX, app]);

  const drawBar = useCallback(
    (g: Graphics) => {
      g.clear();
      g.setFillStyle({ color: barColor});
      g.rect(0, 100, 50, 100 * (targetX ?? 1));
      g.fill();
    },
    [barColor, targetX]
  );
  

  return (
    <pixiContainer>
      <pixiGraphics
        ref={barRef}
        x={100}
        y={0}
        draw={drawBar}
      />
    </pixiContainer>
  );
};

// Usage elsewhere:
export const DemoChart = () => {
  const fake = useMemo(() => {
    const seq = [1, 2, 1.5, 2.5, 1.2];
    let i = 0;
    return async () => {
      const v = seq[i % seq.length];
      await new Promise(res => setTimeout(res, 250));
      i++;
      return v;
    };
  }, []);
  return (
    <Application width={800} height={400} background={0x000000}>
      <MovingBarChart getNextX={fake} />
    </Application>
  );
};
