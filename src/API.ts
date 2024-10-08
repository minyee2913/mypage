import { useRef, useEffect } from "react";

export const Sleep = (ms: number)=>new Promise((r) => setTimeout(r, ms));

export function useInterval(callback: ()=>void, delay: number) {
	const savedCallback = useRef(()=>{});
    
    useEffect(() => {
    	savedCallback.current = callback;
    }, [callback]);
    
    useEffect(() => {
    	function tick() {
        	savedCallback.current();
        }
        if (delay !== null) {
        	let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}