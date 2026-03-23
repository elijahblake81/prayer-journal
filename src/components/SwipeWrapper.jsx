import { useSwipeable } from "react-swipeable";
import { useNavigate } from "react-router-dom";

export default function SwipeWrapper({ next, prev, children }) {
  const navigate = useNavigate();

 
  const handlers = useSwipeable({
    onSwipedLeft: () => next && navigate(next),
    onSwipedRight: () => prev && navigate(prev),
    preventScrollOnSwipe: true,
    trackTouch: true,
    delta: 80,
  });


  return (
    <div {...handlers} style={{ height: "100%" }}>
      {children}
    </div>
  );
}
