import React, { useRef, useEffect, useState } from 'react';

export default function WheelPicker({ data, selectedIndex, onChange, height = 200, itemHeight = 40 }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const animationFrameRef = useRef(null);
  const lastMoveTimeRef = useRef(0);
  const lastMoveYRef = useRef(0);
  const velocityHistoryRef = useRef([]);
  const lastOffsetRef = useRef(0);

  // Calculate initial offset based on selectedIndex
  useEffect(() => {
    if (!isDragging && !animationFrameRef.current) {
      const initialOffset = -(selectedIndex * itemHeight) + (height / 2 - itemHeight / 2);
      setCurrentOffset(initialOffset);
      lastOffsetRef.current = initialOffset;
      lastReportedIndexRef.current = selectedIndex;
    }
  }, [selectedIndex, itemHeight, height, isDragging]);

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
    lastOffsetRef.current = targetOffset;
    
    // Always call onChange to update parent component
    onChange({ 
      value: data[selectedIdx].value, 
      label: data[selectedIdx].label,
      index: selectedIdx
    });
  };

  // Update selected value during momentum scrolling (not during dragging)
  const lastReportedIndexRef = useRef(selectedIndex);
  
  useEffect(() => {
    if (!isDragging && animationFrameRef.current !== null) {
      const selectedIdx = getSelectedIndex(currentOffset);
      // Only update if index actually changed
      if (selectedIdx !== lastReportedIndexRef.current && selectedIdx >= 0 && selectedIdx < data.length) {
        lastReportedIndexRef.current = selectedIdx;
        onChange({ 
          value: data[selectedIdx].value, 
          label: data[selectedIdx].label,
          index: selectedIdx
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOffset, isDragging]);

  // Handle mouse/touch start
  const handleStart = (clientY) => {
    setIsDragging(true);
    setStartY(clientY);
    setVelocity(0);
    lastMoveTimeRef.current = Date.now();
    lastMoveYRef.current = clientY;
    velocityHistoryRef.current = [];
    lastOffsetRef.current = currentOffset;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Handle mouse/touch move
  const handleMove = (clientY) => {
    if (!isDragging) return;
    
    const now = Date.now();
    const timeDelta = Math.max(1, now - lastMoveTimeRef.current);
    const moveDelta = clientY - lastMoveYRef.current;
    
    // Calculate instant velocity (pixels per millisecond)
    const instantVelocity = moveDelta / timeDelta;
    
    // Store velocity in history (keep last 5 samples for smoothing)
    velocityHistoryRef.current.push(instantVelocity);
    if (velocityHistoryRef.current.length > 5) {
      velocityHistoryRef.current.shift();
    }
    
    // Calculate smoothed velocity (average of recent velocities)
    const avgVelocity = velocityHistoryRef.current.reduce((a, b) => a + b, 0) / velocityHistoryRef.current.length;
    const smoothedVelocity = avgVelocity * 16; // Convert to pixels per frame (assuming 60fps)
    
    // Update offset based on movement
    const deltaY = clientY - startY;
    const newOffset = lastOffsetRef.current + deltaY;
    
    // Calculate boundaries
    const minOffset = -(data.length - 1) * itemHeight + (height / 2 - itemHeight / 2);
    const maxOffset = height / 2 - itemHeight / 2;
    
    // Apply with resistance at boundaries
    let boundedOffset = newOffset;
    if (newOffset > maxOffset) {
      const excess = newOffset - maxOffset;
      boundedOffset = maxOffset + excess * 0.2; // Stronger resistance
    } else if (newOffset < minOffset) {
      const excess = newOffset - minOffset;
      boundedOffset = minOffset + excess * 0.2; // Stronger resistance
    }
    
    setCurrentOffset(boundedOffset);
    setStartY(clientY);
    setVelocity(smoothedVelocity);
    
    // Update refs for next frame
    lastMoveTimeRef.current = now;
    lastMoveYRef.current = clientY;
  };

  // Handle mouse/touch end
  const handleEnd = () => {
    setIsDragging(false);
    lastOffsetRef.current = currentOffset;
    
    // Apply momentum based on velocity
    const absVelocity = Math.abs(velocity);
    
    if (absVelocity > 0.5) {
      let momentumOffset = currentOffset;
      // Scale momentum based on velocity (faster scroll = more momentum)
      let momentum = velocity * 1.2; // Increased multiplier for more responsive feel
      const friction = 0.92; // Slightly less friction for smoother deceleration
      
      const animate = () => {
        momentumOffset += momentum;
        momentum *= friction; // Exponential decay
        
        const minOffset = -(data.length - 1) * itemHeight + (height / 2 - itemHeight / 2);
        const maxOffset = height / 2 - itemHeight / 2;
        
        // Bounce back with resistance at boundaries
        if (momentumOffset > maxOffset) {
          const excess = momentumOffset - maxOffset;
          momentumOffset = maxOffset + excess * 0.3;
          momentum *= -0.5; // Reverse and dampen
        } else if (momentumOffset < minOffset) {
          const excess = momentumOffset - minOffset;
          momentumOffset = minOffset + excess * 0.3;
          momentum *= -0.5; // Reverse and dampen
        }
        
        setCurrentOffset(momentumOffset);
        lastOffsetRef.current = momentumOffset;
        
        // Continue animation if momentum is significant
        if (Math.abs(momentum) > 0.2) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Snap to nearest when momentum is low
          snapToNearest(momentumOffset);
          animationFrameRef.current = null;
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Low velocity - snap immediately
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
      const mouseMoveHandler = (e) => {
        e.preventDefault();
        handleMove(e.clientY);
      };
      const mouseUpHandler = () => {
        handleEnd();
      };
      const touchMoveHandler = (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
          handleMove(e.touches[0].clientY);
        }
      };
      const touchEndHandler = () => {
        handleEnd();
      };
      
      document.addEventListener('mousemove', mouseMoveHandler, { passive: false });
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
  }, [isDragging]);

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
          transition: isDragging || animationFrameRef.current ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
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
