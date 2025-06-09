"use client";
import {
	createContext,
	type DetailedHTMLProps,
	type HTMLAttributes,
	type PropsWithoutRef,
	type RefObject,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { twMerge } from "tailwind-merge";

export type Join<T, K> = T & K;

// Context for sharing state between Tooltip and its children
const TooltipContext = createContext({
	isVisible: false,
	setIsVisible: (visible: boolean) => {},
	contentRef: null as RefObject<HTMLParagraphElement | null> | null,
});
type Bound = "top" | "bottom" | "left" | "right";

const isOutOfBounds = (rect: DOMRect, doc: DOMRect): [boolean, Set<Bound>, Record<Bound, number>] => {
	const diffs = {
		top: rect.top - doc.top,
		bottom: doc.bottom - rect.bottom,
		left: rect.left - doc.left,
		right: doc.right - rect.right,
	};

	const out = new Set<Bound>();

	if (rect && doc) {
		for (const [key, value] of Object.entries(diffs)) {
			if (value < 0) {
				out.add(key as Bound);
			}
		}
	}

	return [out.size > 0, out, diffs];
};

type TooltipProps<T extends HTMLElement = HTMLElement> = Join<
	PropsWithoutRef<Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "onMouseOver" | "onMouseOut">>,
	{
		/** The parent element the tooltip is bound to
		 *  @default window.document.body
		 */
		boundingBox?: RefObject<T> | T | null;
	}
>;

const Tooltip = <T extends HTMLElement = HTMLElement>({
	children,
	boundingBox: parentBounds,
	className,
	...props
}: TooltipProps<T>) => {
	const tooltipRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLParagraphElement>(null);
	const [isHovered, setIsHovered] = useState(false);

	const boundingBox = useMemo(() => {
		if (typeof document === "undefined") return null;
		if (parentBounds) {
			if (parentBounds instanceof HTMLElement) return parentBounds;
			return parentBounds.current;
		}
		return document.body;
	}, [, parentBounds]);

	const getCurrentBounds = useCallback(() => {
		if (!(contentRef.current && boundingBox && tooltipRef.current)) return;
		const rect = contentRef.current.getBoundingClientRect();
		const doc = boundingBox.getBoundingClientRect();
		return isOutOfBounds(rect, doc);
	}, [, boundingBox]);

	useEffect(
		function onHover() {
			if (!(tooltipRef.current && contentRef.current)) return;
			if (isHovered) {
				tooltipRef.current.classList.add("tooltip-visible");
				const resp = getCurrentBounds();
				if (resp) {
					const [isOut, outSet, diffs] = resp;
					if (isOut) {
						let translateX = 0;
						let translateY = 0;

						for (const bound of outSet) {
							if (bound === "right") {
								translateX = diffs.right;
							} else if (bound === "left") {
								translateX = -diffs.left;
							} else if (bound === "top") {
								translateY = -diffs.top;
							} else {
								translateY = diffs.bottom;
							}
						}

						const transformRule = `translateX(${translateX}px) translateY(${translateY}px)`;
						contentRef.current.style.transform = transformRule;
					}
				}
			} else {
				tooltipRef.current.classList.remove("tooltip-visible");
			}
		},
		[isHovered]
	);

	return (
		<TooltipContext.Provider
			value={{
				isVisible: isHovered,
				setIsVisible: setIsHovered,
				contentRef,
			}}
		>
			<div
				className={twMerge("tooltip relative", className)}
				ref={tooltipRef}
				onMouseOver={() => setIsHovered(true)}
				onMouseOut={() => setIsHovered(false)}
				{...props}
			>
				{children}
			</div>
		</TooltipContext.Provider>
	);
};

type TooltipContentProps = Join<
	PropsWithoutRef<
		Omit<DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, "aria-hidden" | "aria-description">
	>,
	{
		/** The position of the tooltip relative to the parent element
		 *  @default bottom
		 */
		position?: Bound;
	}
>;

const TooltipContent = ({ children, className, position: pos = "bottom", ...props }: TooltipContentProps) => {
	const { isVisible, contentRef } = useContext(TooltipContext);

	const position = useMemo(
		() =>
			({
				bottom: "top-full left-1/2 right-1/2 -translate-x-1/2",
				left: "right-full bottom-1/2 top-1/2 -translate-y-1/2",
				right: "left-full bottom-1/2 top-1/2 -translate-y-1/2",
				top: "bottom-full left-1/2 right-1/2 -translate-x-1/2",
			}[pos]),
		[pos]
	);
	return (
		<p
			ref={contentRef}
			className={twMerge("tooltip-content mt-2 rounded-sm bg-zinc-800 text-white p-2 text-xs", position, className)}
			aria-hidden={!isVisible}
			aria-description={String(children)}
			{...props}
		>
			{children}
		</p>
	);
};
// Attach Content as a static property
Tooltip.Content = TooltipContent;

export default Tooltip;
export type { Bound };
