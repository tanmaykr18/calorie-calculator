import React, { useRef, useEffect, useState } from 'react';

export default function WheelPicker({ data, selectedIndex, onChange, height = 200, itemHeight = 40 }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const animationFrameRef = useRef(null);

  // Calculate initial offset based on selectedIndex
  useEffect(() => {
    const initialOffset = -selectedIndex * itemHeight;
    setCurrentOffset(initialOffset);
  }, [selectedIndex, itemHeight]);

  // Get the index of the item closest to center
  const getSelectedIndex = (offset) => {
    const centerOffset = height / 2 - itemHeight / 2;
    const relativeOffset = centerOffset - offset;
    const index = Math.round(relativeOffset / itemHeight);
    return Math.max(0, Math.min(data.length - 1, index));
  };

  // Snap to nearest item
  const snapToNearest = (offset) => {
    const selectedIdx = getSelectedIndex(offset);
    const targetOffset = -(selectedIdx * itemHeight) + (height / 2 - itemHeight / 2);
    
    setCurrentOffset(targetOffset);
    if (selectedIdx !== selectedIndex) {
      onChange({ 
        value: data[selectedIdx].value, 
        label: data[selectedIdx].label,
        index: selectedIdx
      });
    }
  };

  // Handle mouse/touch start
  const handleStart = (clientY) => {
    setIsDragging(true);
    setStartY(clientY);
    setVelocity(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Handle mouse/touch move
  const handleMove = (clientY) => {
    if (!isDragging) return;
    
    const deltaY = clientY - startY;
    const newOffset = currentOffset + deltaY;
    
    // Calculate boundaries
    const minOffset = -(data.length - 1) * itemHeight + (height / 2 - itemHeight / 2);
    const maxOffset = height / 2 - itemHeight / 2;
    
    // Apply with resistance at boundaries
    let boundedOffset = newOffset;
    if (newOffset > maxOffset) {
      boundedOffset = maxOffset + (newOffset - maxOffset) * 0.3;
    } else if (newOffset < minOffset) {
      boundedOffset = minOffset + (newOffset - minOffset) * 0.3;
    }
    
    setCurrentOffset(boundedOffset);
    setStartY(clientY);
    
    // Calculate velocity for momentum
    setVelocity(deltaY);
  };

  // Handle mouse/touch end
  const handleEnd = () => {
    setIsDragging(false);
    
    // Apply momentum
    if (Math.abs(velocity) > 2) {
      let momentumOffset = currentOffset;
      let momentum = velocity * 0.9;
      
      const animate = () => {
        momentumOffset += momentum;
        momentum *= 0.95;
        
        const minOffset = -(data.length - 1) * itemHeight + (height / 2 - itemHeight / 2);
        const maxOffset = height / 2 - itemHeight / 2;
        
        if (momentumOffset > maxOffset) {
          momentumOffset = maxOffset;
          momentum = 0;
        } else if (momentumOffset < minOffset) {
          momentumOffset = minOffset;
          momentum = 0;
        }
        
        setCurrentOffset(momentumOffset);
        
        if (Math.abs(momentum) > 0.1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          snapToNearest(momentumOffset);
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      snapToNearest(currentOffset);
    }
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      handleMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Global mouse/touch listeners
  useEffect(() => {
    if (isDragging) {
      const mouseMoveHandler = (e) => handleMove(e.clientY);
      const mouseUpHandler = () => handleEnd();
      const touchMoveHandler = (e) => {
        e.preventDefault();
        handleMove(e.touches[0].clientY);
      };
      const touchEndHandler = () => handleEnd();
      
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      document.addEventListener('touchmove', touchMoveHandler, { passive: false });
      document.addEventListener('touchend', touchEndHandler);
      
      return () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        document.removeEventListener('touchmove', touchMoveHandler);
        document.removeEventListener('touchend', touchEndHandler);
      };
    }
  }, [isDragging, currentOffset, startY, velocity]);

  // Calculate opacity and scale for items based on distance from center
  const getItemStyle = (index) => {
    const itemOffset = index * itemHeight;
    const centerY = height / 2;
    const itemCenter = -currentOffset + itemOffset + itemHeight / 2;
    const distance = Math.abs(itemCenter - centerY);
    const maxDistance = height / 2;
    const ratio = 1 - Math.min(distance / maxDistance, 1);
    
    return {
      opacity: 0.3 + ratio * 0.7,
      transform: `scale(${0.8 + ratio * 0.2})`,
      fontWeight: ratio > 0.8 ? 700 : 500,
    };
  };

  return (
    <div
      ref={containerRef}
      className="wheel-picker-wrapper relative overflow-hidden"
      style={{
        height: `${height}px`,
        touchAction: 'none',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Selection indicator */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          top: `${height / 2 - itemHeight / 2}px`,
          height: `${itemHeight}px`,
          borderTop: '2px solid #3b82f6',
          borderBottom: '2px solid #3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '4px',
        }}
      />
      
      {/* Gradient masks */}
      <div
        className="wheel-picker-mask-top absolute top-0 left-0 right-0 pointer-events-none z-20"
        style={{
          height: `${height / 2 - itemHeight / 2}px`,
        }}
      />
      <div
        className="wheel-picker-mask-bottom absolute bottom-0 left-0 right-0 pointer-events-none z-20"
        style={{
          height: `${height / 2 - itemHeight / 2}px`,
        }}
      />

      {/* Items */}
      <div
        className="wheel-picker-items"
        style={{
          transform: `translateY(${currentOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {data.map((item, index) => (
          <div
            key={index}
            className="wheel-picker-item flex items-center justify-center cursor-pointer select-none"
            style={{
              height: `${itemHeight}px`,
              fontSize: '1.5rem',
              color: getItemStyle(index).opacity > 0.8 ? '#3b82f6' : 'inherit',
              ...getItemStyle(index),
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
