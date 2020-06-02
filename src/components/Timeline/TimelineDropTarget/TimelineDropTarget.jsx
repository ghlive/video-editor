import React, {
  useRef,
  useContext,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { useDrop } from 'react-dnd';
import FrameBar from '../FrameBar';
import { store } from '../../../store';
import { UPDATE_CURRENT_DROPPED_ITEM } from '../../../constants';
import { useWait, isEmpty } from '../../../util';

const TimelineDropTarget = ({
  index,
  accept,
  type,
  frames,
  title,
  ...props
}) => {
  const { dispatch } = useContext(store);
  const [wait, done] = useWait();
  const doneRef = useRef(done);
  const collectedPropsRef = useRef();
  const ref = useRef();
  const [hoveringItem, setHoveringItem] = useState({});

  useEffect(() => {
    doneRef.current = done;
  });

  const getOffsetCoords = (monitor, targetRef) => {
    const offset = monitor.getSourceClientOffset();
    if (!(offset && targetRef.current)) return null;

    const dropTargetXy = targetRef.current.getBoundingClientRect();
    const x =
      offset.x - dropTargetXy.left < 0 ? 0 : offset.x - dropTargetXy.left;
    const y = offset.y - dropTargetXy.top;

    const coords = {
      x,
      y,
    };

    return coords;
  };

  const handleHover = useCallback(
    (item, monitor, targetRef) => {
      if (!doneRef.current) return collectedPropsRef.current;
      if (monitor.canDrop()) {
        const coords = getOffsetCoords(monitor, targetRef);
        wait(120); // debounce
        setHoveringItem({ type: item.type, coords });
      }
    },
    [wait]
  );

  const handleDrop = useCallback(
    (index, item, monitor, targetRef) => {
      console.log('dropped');
      if (monitor.canDrop()) {
        const coords = getOffsetCoords(monitor, targetRef);
        dispatch({
          type: UPDATE_CURRENT_DROPPED_ITEM,
          payload: coords,
        });
      }

      //   setDroppedMedia(
      //     update(
      //       droppedMedia,
      //       item.index ? { $push: [item.index] } : { $push: [] }
      //     )
      //   );
      //   setTimelineLayers(
      //     update(timelineLayers, {
      //       [index]: {
      //         lastDroppedItem: {
      //           $set: item,
      //         },
      //       },
      //     })
      //   );
    },
    [dispatch]
  );

  const [{ isOver, canDrop }, dropTarget] = useDrop({
    accept,
    drop: (item, monitor) => handleDrop(index, item, monitor, dropTarget(ref)),
    hover: (item, monitor, component) =>
      handleHover(item, monitor, dropTarget(ref)),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  let backgroundColor = isActive
    ? 'rgb(109, 109, 109)'
    : canDrop
    ? 'rgb(189, 192, 195)'
    : 'transparent';

  return (
    <div
      className='timeline-layer-content'
      ref={dropTarget(ref)}
      accept={accept}
      style={{ backgroundColor }}
    >
      {frames && frames.length ? (
        frames.map((frame, index) => <FrameBar key={index} frame={frame} />)
      ) : !isEmpty(hoveringItem) && type === hoveringItem.type && isOver ? (
        <FrameBar key={index} frame={hoveringItem} />
      ) : (
        ''
      )}
    </div>
  );
};

export default TimelineDropTarget;
