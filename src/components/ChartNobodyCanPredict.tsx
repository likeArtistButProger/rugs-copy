import { useEffect, useMemo, useReducer, useRef, type FC } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, HTMLText } from "pixi.js";

extend({Container, Graphics, HtmlText: HTMLText});

// NOTE(Nikita): Constants
const GREEN_BAR = "#00aa00";
const RED_BAR = "#aa0000";

const SCALE_Y = 60;
const OFFSET_TOP = 10;
const OFFSET_CHART_X = 60;
const OFFSET_TEXT_X = 15;
const OFFSET_BETWEEN_BARS = 2;
const BAR_WIDTH = 20;

const TICKS_PER_BAR = 5;
const MULTIPLIER_UPDATE_INTERVAL_MS = 250;

const PriceLines = ({ height }: { height: number }) => {
    return (
        <>
         {
                Array.from({ length: 10 }).map((_, i) => (
                    <pixiContainer
                        key={`line-container-${i}`}
                        x={0}
                        y={height / 10 * i + OFFSET_TOP}
                    >
                        <pixiContainer>
                            <pixiHtmlText
                                x={OFFSET_TEXT_X}
                                y={-10}
                                text={`${10 - i}.00x`}
                                style={{
                                    fontFamily: "Tahoma",
                                    fontSize: 12,
                                    fill: "#FFFFFF",
                                    align: "center"
                                }}
                            />
                        </pixiContainer>
                        <pixiGraphics
                            key={`line-${i}`}
                            x={0}
                            y={0}
                            draw={(g: Graphics) => {
                                g.clear();
                                g.setStrokeStyle({ color: "#FFFFFF", width: 2, alpha: 0.3 });
                                g.moveTo(OFFSET_CHART_X, 0);
                                g.lineTo(10000, 0);
                                g.stroke();
                            }}
                        />
                    </pixiContainer>
                ))
        }
        </>
    )
}

interface MovingBarProps {
    startPrice: number;
    askForNextPrice: () => Promise<number>;
    width: number;
    height: number;
    barIndex: number;
    endPrice?: number;
    showCurrentPrice?: boolean;
}

const MovingBar: FC<MovingBarProps> = ({ startPrice, askForNextPrice, endPrice, width, height, barIndex, showCurrentPrice }) => {
    const currentPrice = useRef<number>(startPrice);
    const startY = useRef<number>(0);

    useEffect(() => {
        let cancelled = false;

        if(endPrice) {
            currentPrice.current = endPrice;
        } else {
            const fetchMultiplierLoop = async () => {
                while (currentPrice.current !== 0 && !cancelled) {
                    const nextMultiplier = await askForNextPrice();
                    currentPrice.current = nextMultiplier;
                }
            }
            fetchMultiplierLoop();
        }

        return () => {
            cancelled = true;
        }
    }, [endPrice]);
    
    const drawBar = (g: Graphics) => {
        // NOTE(Nikita): Calculate the percentage difference between current and previous multiplier
        //               Minus sign used to reverse the direction of bar
        const priceDifference = Number((currentPrice.current - startPrice).toFixed(4));
        // console.log("Current price:", currentPrice.current, "Start price:", startPrice, "Price difference:", priceDifference);
        const barHeight = SCALE_Y * Math.abs(priceDifference);
        const startX = OFFSET_CHART_X + barIndex * (BAR_WIDTH + OFFSET_BETWEEN_BARS);

        g.clear();
        g.setFillStyle({ color: priceDifference > 0 ? GREEN_BAR : RED_BAR });
        if(priceDifference > 0) {
            startY.current = OFFSET_TOP + height - currentPrice.current * SCALE_Y;
            g.rect(startX, startY.current, BAR_WIDTH, barHeight);
        }
        else {
            startY.current = OFFSET_TOP + height - startPrice * SCALE_Y;
            g.rect(startX, startY.current, BAR_WIDTH, barHeight);
        }
        g.fill();
    };

    return (
        <pixiContainer>
            <pixiContainer
                x={0}
                y={startY.current}
            >
                {
                    showCurrentPrice && (currentPrice.current !== 0) && (
                        <>
                            <pixiContainer>
                                <pixiHtmlText
                                    x={width - OFFSET_TEXT_X - 100}
                                    y={-20}
                                    text={`${currentPrice.current.toFixed(4)}x`}
                                    style={{
                                        fontFamily: "Tahoma",
                                        fontSize: 12,
                                        fill: "#FFFFFF",
                                        align: "center"
                                    }}
                                />
                            </pixiContainer>
                            <pixiGraphics
                                x={0}
                                y={0}
                                draw={(g: Graphics) => {
                                    g.clear();
                                    g.setStrokeStyle({ color: "#FFAC0E", width: 2, alpha: 0.3 });
                                    g.moveTo(OFFSET_CHART_X, 0);
                                    g.lineTo(10000, 0);
                                    g.stroke();
                                }}
                            />
                        </>
                    )
                }
            </pixiContainer>
            <pixiGraphics
                x={0}
                y={0}
                draw={drawBar}
            />
        </pixiContainer>
    )
}

interface ChartNobodyCanPredictProps {
    width?: number;
    height?: number;
    backgroundColor?: string;
}

// TODO(Nikita): Move to backend after chart completed
function driftPrice(
    price: number,
    DRIFT_MIN: number,
    DRIFT_MAX: number,
    BIG_MOVE_CHANCE: number,
    BIG_MOVE_MIN: number,
    BIG_MOVE_MAX: number,
    randFn: () => number,
    version = 'v3',
    GOD_CANDLE_CHANCE = 0.00001,
    GOD_CANDLE_MOVE = 10.0,
    STARTING_PRICE = 1.0
) {
    // v3 adds God Candle feature - rare massive price increase
    if (version === 'v3' && randFn() < GOD_CANDLE_CHANCE && price <= 100 * STARTING_PRICE) {
        return price * GOD_CANDLE_MOVE;
    }
    
    let change = 0;
    
    if (randFn() < BIG_MOVE_CHANCE) {
        const moveSize = BIG_MOVE_MIN + randFn() * (BIG_MOVE_MAX - BIG_MOVE_MIN);
        change = randFn() > 0.5 ? moveSize : -moveSize;
    } else {
        const drift = DRIFT_MIN + randFn() * (DRIFT_MAX - DRIFT_MIN);
        
        // Version difference is in this volatility calculation
        const volatility = version === 'v1'
            ? 0.005 * Math.sqrt(price)
            : 0.005 * Math.min(10, Math.sqrt(price));
            
        change = drift + (volatility * (2 * randFn() - 1));
    }
    
    let newPrice = price * (1 + change);

    if (newPrice < 0) {
        newPrice = 0;
    }

    return Number(newPrice.toFixed(4));
}

const DRIFT_MIN = -0.3;
const DRIFT_MAX = 0.4;
const BIG_MOVE_CHANCE = 0.1;
const BIG_MOVE_MIN = -2;
const BIG_MOVE_MAX = 2;

export const ChartNobodyCanPredict: FC<ChartNobodyCanPredictProps> = ({ width, height, backgroundColor }) => {
    const endPrices = useRef<number[]>([]);
    const tick = useRef<number>(0);
    const price = useRef<number>(1.0);
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const definedWidth = useMemo(() => width || 800, [width]);
    const definedHeight = useMemo(() => height || 400, [height]);

    const askForNextPrice = async () => {
        let newPrice = driftPrice(
            price.current,
            DRIFT_MIN,
            DRIFT_MAX,
            BIG_MOVE_CHANCE,
            BIG_MOVE_MIN,
            BIG_MOVE_MAX,
            Math.random
        );

        while(
            newPrice === price.current
            || (endPrices.current.length > 0 && Math.abs(newPrice - endPrices.current[endPrices.current.length - 1]) < 0.3)
            || newPrice > 10
        ) {
            newPrice = driftPrice(
                price.current,
                DRIFT_MIN,
                DRIFT_MAX,
                BIG_MOVE_CHANCE,
                BIG_MOVE_MIN,
                BIG_MOVE_MAX,
                Math.random
            );

            if (newPrice === 0) {
                break;
            }
        }

        await new Promise(resolve => setTimeout(resolve, MULTIPLIER_UPDATE_INTERVAL_MS));

        if(tick.current >= TICKS_PER_BAR && tick.current % TICKS_PER_BAR === 0) {
            endPrices.current.push(newPrice);
        }

        console.log("New price:", newPrice);

        forceUpdate();
        price.current = newPrice;
        tick.current++;
        return price.current;
    };

    return (
        <Application
            width={width || 800}
            height={definedHeight}
            backgroundColor={backgroundColor || "#000000"}
        >
            <PriceLines height={definedHeight} />
            {
                endPrices.current.map((fixedPrice, index) => (
                    <MovingBar
                        key={index}
                        startPrice={index === 0 ? 1 : endPrices.current[index - 1]}
                        askForNextPrice={askForNextPrice}
                        barIndex={index}
                        endPrice={fixedPrice}
                        height={definedHeight}
                        width={definedWidth}
                    />
                ))
            }
            <MovingBar
                startPrice={endPrices.current.length > 0 ? endPrices.current[endPrices.current.length - 1] : 1}
                askForNextPrice={askForNextPrice}
                barIndex={endPrices.current.length}
                height={definedHeight}
                width={definedWidth}
                showCurrentPrice
            />
        </Application>
    )
}