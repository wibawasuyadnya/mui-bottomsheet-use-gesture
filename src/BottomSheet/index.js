import React, { forwardRef, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  styled,
  Paper,
  Modal,
  getDrawerUtilityClass,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { unstable_composeClasses as composeClasses } from '@mui/base';
import { useSpring, config as springConfig, a } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

import { useDimension } from '../hooks/useDimension';
import { useWindowSize } from '../hooks/useWindowSize';
import { useBoolean } from '../hooks/useBoolean';

import { BottomSheetDefaultHeader } from './BottomSheetDefaultHeader';
import { BottomSheetHeader } from './BottomSheetHeader';
import { TOGGLE, CLOSE, DRAGGABLE } from './actions';

const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;
  const slots = {
    root: ['root'],
    modal: ['modal'],
    paper: ['paper', `paperAnchorBottom`],
  };
  return composeClasses(slots, getDrawerUtilityClass, classes);
};

const overridesResolver = (props, styles) => {
  return [styles.root, styles.modal];
};

const BottomSheetRoot = styled(Modal, {
  name: 'MuiBottomSheet',
  slot: 'Root',
  overridesResolver,
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer,
}));

const BottomSheetPaper = styled(Paper, {
  name: 'MuiBottomSheet',
  slot: 'Paper',
  overridesResolver: (props, styles) => {
    return [styles.paper, styles[`paperAnchorBottom`]];
  },
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0 auto',
  width: '100%',
  height: '100%',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
}));

const paperWrapperStyle = {
  '--bottomsheet-width': '100vw',
  '--bottomsheet-height': '200vh',
  '--bottomsheet-padding': '8px',
  paddingTop: 'var(--bottomsheet-offset-top)',
  paddingLeft: 'var(--bottomsheet-padding)',
  paddingRight: 'var(--bottomsheet-padding)',
  boxSizing: 'border-box',
  overflowY: 'hidden',
  position: 'fixed',
  width: 'var(--bottomsheet-width)',
  height: 'var(--bottomsheet-height)',
  minHeight: '10%',
  // add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: 'touch',
  touchAction: 'none',
  outline: 'none',
};

const BottomSheet = forwardRef(function BottomSheet(inProps, ref) {
  const bottomSheetOffsetTop = 32;
  const props = useThemeProps({ props: inProps, name: 'MuiBottomSheet' });
  const theme = useTheme();

  const {
    threshold = [0, 0.5, 1],
    draggable = false,
    header = {
      type: 'default',
      actions: [TOGGLE, DRAGGABLE, CLOSE],
    },
    open = false,
    elevation = 16,
    notchWidth = 25,
    className,
    children,
    onOpen,
    onClose,
    ModalProps: { ...ModalProps } = {},
    PaperProps = {},
    ...other
  } = props;

  const ownerState = {
    ...props,
    open,
    elevation,
    ...other,
  };

  const currentY = useRef(0);

  /**
   * Boolean state for knowing if the modal children is rendered
   */
  const {
    value: isRendered,
    setTrue: setRendered,
    setFalse: setNotRendered,
  } = useBoolean(false);

  /**
   * Boolean state for control the toggle of bottom sheet between draggable
   * and not draggable
   */
  const { value: toggleDraggable, toggle: handleDragToggle } =
    useBoolean(draggable);

  /**
   * String state to know which threshold bottom sheet is currently at
   * @see {@link handleExpandToggle}
   */
  const [currentThreshold, setCurrentThreshold] = useState('close');

  const classes = useUtilityClasses(ownerState);

  const {
    previous: previousViewport,
    current: currentViewport,
    isReady: isViewportReady,
  } = useWindowSize();
  const { height: viewportHeight } = currentViewport;

  const [bodyRef, { dimension: bodyDimension }] = useDimension();
  const bodyHeight = bodyDimension.height;

  const getBottomSheetHeights = () => {
    const [bottomThreshold, middleThreshold, topThreshold] = threshold;
    const isAutoHeight =
      typeof middleThreshold === 'string' && middleThreshold === 'auto';
    if (isAutoHeight) {
      return {
        closeHeight: -viewportHeight * bottomThreshold,
        fullHeight: -viewportHeight * topThreshold,
      };
    }
    return {
      closeHeight: -viewportHeight * bottomThreshold,
      fullHeight: -viewportHeight * topThreshold,
    };
  };

  const { closeHeight, fullHeight } = getBottomSheetHeights();

  const [{ y }, animate] = useSpring(
    () => ({
      /**
       * First render set y to 0, and later when resize set the y
       * based on the y and previous screen height so it keep
       * the same height across different screen size
       */
      y: currentY.current,
      /**
       * Check to see if the y is around default height and full height,
       * if so set the current threshold to the closest threshold
       */
      onChange: ({ value: { y } }) => {
        if (y >= closeHeight - 20 && y <= closeHeight + 20) {
          setCurrentThreshold('default');
          return;
        }

        if (y >= fullHeight - 20 && y <= fullHeight + 20) {
          setCurrentThreshold('full');
          return;
        }
      },
    }),
    [closeHeight, fullHeight]
  );

  /**
   * Get different configuration of spring animation based on threshold
   */
  const configOf = (state, type) => {
    switch (type) {
      case 'once':
        return {
          tension: 246,
          friction: 32,
        };
      case 'close':
        return { ...springConfig.stiff, ...state };
      case 'default':
        return state.canceled ? springConfig.wobbly : springConfig.stiff;
      case 'full':
        return state.canceled ? springConfig.wobbly : springConfig.stiff;
      default:
        throw Error('invalid animate type!');
    }
  };

  /**
   * Animate bottom sheet to default height
   */
  const toDefaultHeight = (param) => {
    const defaultParam = param || { canceled: false };
    animate.start({
      immediate: false,
      y: fullHeight,
      config: configOf(defaultParam, 'full'),
    });
  };

  /**
   * Animate bottom sheet to close height
   */
  const toCloseHeight = (param) => {
    const defaultParam = param || { velocity: 0 };
    animate.start({
      immediate: false,
      y: closeHeight,
      config: configOf(defaultParam, 'close'),
      onResolve: () => {
        currentY.current = 0;
        onClose();
      },
    });
  };

  /**
   * Animate bottom sheet to full height
   */
  const toFullHeight = (param) => {
    const defaultParam = param || {
      canceled: false,
    };
    animate.start({
      immediate: false,
      y: fullHeight,
      config: configOf(defaultParam, 'full'),
    });
  };

  const resetToClosestThreshold = (param) => {
    const { canceled } = param || {
      canceled: false,
    };
    if (currentThreshold === 'full') {
      toFullHeight({ canceled });
      return;
    }
  };

  const handleDragCancelGesture = (gestureState) => {
    const {
      direction: [, dy],
      movement: [, my],
      cancel,
    } = gestureState;
    const direction = dy > 0 ? 'down' : 'up';
    const aboveDefaultThreshold = my < -40;
    const aboveFullThreshold = my < -40;
    if (
      direction === 'up' &&
      currentThreshold === 'default' &&
      aboveDefaultThreshold
    ) {
      cancel();
    }
    if (
      direction === 'up' &&
      currentThreshold === 'full' &&
      aboveFullThreshold
    ) {
      cancel();
    }
  };

  /**
   * Check if bottom sheet should close or not.
   *
   * To close the bottom sheet, return true.
   *
   * To cancel the action, return false.
   */
  const shouldBottomSheetClose = (gestureState) => {
    const {
      direction: [, dy],
      velocity: [, vy],
      movement: [, my],
    } = gestureState;
    const direction = dy > 0 ? 'down' : 'up';
    const belowCloseThreshold = my > 60;
    const isQuickDrag = vy >= 2.0;
    const belowCloseHeight = y.get() > -viewportHeight * 0.2;
    if (belowCloseHeight) {
      return true;
    }
    if (direction === 'down' && isQuickDrag && belowCloseThreshold) {
      return true;
    }
    return false;
  };

  /**
   * Handler to decide which drag direction is current invoking
   */
  const handleDragDirection = (gestureState) => {
    const {
      direction: [, dy],
    } = gestureState;
    const direction = dy > 0 ? 'down' : 'up';
    direction === 'up'
      ? handleDragDirectionUp(gestureState)
      : handleDragDirectionDown(gestureState);
  };

  /**
   * Handle drag direction up
   */
  const handleDragDirectionUp = (gestureState) => {
    const {
      movement: [, my],
      velocity: [, vy],
      canceled,
      last,
    } = gestureState;
    if (last) {
      const isFlickUpward = vy > 0.2;
      const isAboveDefaultThreshold = my < -40;
      if (isFlickUpward || isAboveDefaultThreshold) {
        toFullHeight({ canceled });
      } else {
        resetToClosestThreshold(canceled);
      }
    }
  };

  /**
   * Handle drag direction down
   */
  const handleDragDirectionDown = (gestureState) => {
    const close = shouldBottomSheetClose(gestureState);
    const {
      movement: [, my],
      velocity: [, vy],
      canceled,
      last,
    } = gestureState;
    if (last) {
      if (close) {
        toCloseHeight({ velocity: vy });
      } else {
        resetToClosestThreshold({ canceled });
      }
    }
  };

  /**
   * When the user keeps dragging, we just move the sheet according to
   * the cursor position
   */
  const handleCursorPositionChange = (gestureState) => {
    const {
      last,
      movement: [, my],
    } = gestureState;
    if (!last) {
      animate.start({
        immediate: true,
        y: my + currentY.current,
      });
    }
  };

  /**
   * When the user keep dragging, we don't want to user to drag the
   * bottom sheet over the full height threshold which could lead to
   * NaN value and animation crash.
   */
  const handleBottomSheetDrag = (gestureState) => {
    const {
      movement: [, my],
    } = gestureState;
    const belowFullHeight = my + currentY.current > fullHeight;
    if (belowFullHeight)
      animate.start({
        immediate: false,
        y: my + currentY.current,
      });
  };

  /**
   * When the user drag the bottomsheet to close to the close threshold,
   * if below the close threshold then we close the bottom sheet.
   * @see {@link shouldBottomSheetClose}
   */
  const handleNearCloseThreshold = (gestureState) => {
    const close = shouldBottomSheetClose(gestureState);
    const {
      velocity: [, vy],
    } = gestureState;
    if (close) {
      toCloseHeight({ velocity: vy });
    }
  };

  /**
   * Hook for handle creation of gestures handler
   */
  const bind = useGesture(
    {
      onDragStart: (gestureState) => {
        const { dragging } = gestureState;
        if (dragging) {
          currentY.current = y.get();
        }
      },
      onDrag: (gestureState) => {
        const { tap } = gestureState;
        if (tap) return;
        if (!toggleDraggable) {
          handleDragCancelGesture(gestureState);
          handleDragDirection(gestureState);
          handleCursorPositionChange(gestureState);
        } else {
          handleBottomSheetDrag(gestureState);
        }
      },
      onDragEnd: (gestureState) => {
        handleNearCloseThreshold(gestureState);
      },
    },
    {
      drag: {
        from: () => [0, -y.get()],
        delay: 200,
        filterTaps: true,
        bounds: {
          top: 0,
        },
        rubberband: true,
      },
    }
  );

  /**
   * Callback that handle toggle between default height to full height
   * then back and forth
   */
  const handleExpandToggle = () => {
    currentThreshold === 'full' && toFullHeight();
  };

  /**
   * Callback when click on close button
   */
  const handleCloseClick = () => {
    toCloseHeight();
  };

  /**
   * Side effect that wait for modal to be rendered
   */
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        setRendered();
      }, 0);
      return () => {
        setNotRendered();
        clearTimeout(timeout);
      };
    }
  }, [open]);

  /**
   * Side effect that open bottomsheet but wait until the modal
   * children is rendered
   */
  useEffect(() => {
    if (open) {
      toFullHeight();
      return () => {
        onClose();
      };
    }
  }, [isRendered]);

  /**
   * Side effect that keep the bottomsheet height
   * the same across different window height
   */
  useEffect(() => {
    const getY = () => {
      const previousY = y.get();
      const previousHeight = -previousViewport.height;
      const currentHeight = -currentViewport.height;
      const updateY = (previousY * currentHeight) / previousHeight;
      if (updateY <= currentHeight) {
        return Math.max(updateY, currentHeight);
      }
      return updateY;
    };

    if (isViewportReady && previousViewport) {
      currentY.current = getY();
    }
  }, [currentViewport]);

  return (
    <BottomSheetRoot
      className={clsx(classes.root, classes.modal, className)}
      open={open}
      ownerState={ownerState}
      onClose={onClose}
      ref={ref}
      {...other}
      {...ModalProps}
      BackdropComponent={null}
    >
      <a.div
        className={'MuiBottomSheetPaper-Wrapper'}
        style={{
          ...paperWrapperStyle,
          '--bottomsheet-offset-top': `${bottomSheetOffsetTop}px`,
          zIndex: theme.zIndex.drawer,
          left: 0,
          top: `${viewportHeight}px`,
          // animating values
          y,
        }}
        {...bind()}
      >
        <BottomSheetPaper
          elevation={elevation}
          square
          {...PaperProps}
          className={clsx(classes.paper, PaperProps.className)}
          ownerState={ownerState}
        >
          <div ref={bodyRef}>
            {header.type === 'default' && (
              <BottomSheetDefaultHeader {...{ notchWidth }} />
            )}
            {header.type === 'actions' && (
              <BottomSheetHeader
                actions={header.actions}
                expand={currentThreshold === 'full'}
                isDraggable={toggleDraggable}
                onDragToggle={handleDragToggle}
                onToggleClick={handleExpandToggle}
                onCloseClick={handleCloseClick}
              />
            )}
            {children}
          </div>
        </BottomSheetPaper>
      </a.div>
    </BottomSheetRoot>
  );
});

BottomSheet.propTypes = {
  /**
   * Threshold for control the levels of bottomsheet
   */
  threshold: PropTypes.array,
  /**
   * Enabled Bottom Sheet to be draggable.
   * @default false
   */
  draggable: PropTypes.bool,
  /**
   * Custom Bottom Sheet Header to be display
   */
  header: PropTypes.shape({
    type: PropTypes.string,
    actions: PropTypes.array,
  }),
  /**
   * Custom notch width of the custom bottom sheet header
   */
  notchWidth: PropTypes.number,
  /**
   * The elevation of the drawer.
   * @default 16
   */
  elevation: PropTypes.number,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * Callback fired when the component requests to be closed.
   * @param {object} event The event source of the callback.
   */
  onClose: PropTypes.func,
  /**
   * If `true`, the component is shown.
   * @default false
   */
  open: PropTypes.bool,
  /**
   * Props applied to the [`Modal`](/material-ui/api/modal/) element.
   * @default {}
   */
  ModalProps: PropTypes.object,
  /**
   * Props applied to the [`Paper`](/material-ui/api/paper/) element.
   * @default {}
   */
  PaperProps: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as
   * additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The content of the component.
   */
  children: PropTypes.node,
};

export { BottomSheet };
