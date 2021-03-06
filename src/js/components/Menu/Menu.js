import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import styled, { withTheme } from 'styled-components';

import { defaultProps } from '../../default-props';

import { Box } from '../Box';
import { Button } from '../Button';
import { DropButton } from '../DropButton';
import { Keyboard } from '../Keyboard';
import { Text } from '../Text';
import { withForwardRef } from '../hocs';
import { normalizeColor } from '../../utils';

const ContainerBox = styled(Box)`
  max-height: inherit;

  /* IE11 hack to get drop contents to not overflow */
  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    width: 100%;
  }

  ${props => props.theme.menu.extend};
`;

class Menu extends Component {
  static defaultProps = {
    dropAlign: { top: 'top', left: 'left' },
    items: [],
    messages: { openMenu: 'Open Menu', closeMenu: 'Close Menu' },
    justifyContent: 'start',
  };

  state = { activeItemIndex: -1, open: false };

  buttonRefs = {};

  onDropClose = () => {
    this.setState({
      activeItemIndex: -1,
      open: false,
    });
  };

  onSelectMenuItem = event => {
    const { activeItemIndex } = this.state;
    if (activeItemIndex >= 0) {
      event.preventDefault();
      event.stopPropagation();
      this.buttonRefs[activeItemIndex].click();
    }
  };

  onNextMenuItem = event => {
    event.preventDefault();
    const { activeItemIndex, open } = this.state;
    if (!open) {
      this.setState({
        open: true,
        activeItemIndex: -1,
      });
    } else {
      const { items } = this.props;
      const index = Math.min(activeItemIndex + 1, items.length - 1);
      this.setState({ activeItemIndex: index });
      // this.setState({ activeSuggestionIndex: index },
      //   this._announceSuggestion.bind(this, index));
    }
  };

  onPreviousMenuItem = event => {
    event.preventDefault();
    const { activeItemIndex, open } = this.state;
    if (!open) {
      this.setState({
        open: true,
        activeItemIndex: -1,
      });
    } else {
      const { items } = this.props;
      const index =
        activeItemIndex === -1
          ? items.length - 1
          : Math.max(activeItemIndex - 1, 0);
      this.setState({ activeItemIndex: index });
      // this.setState({ activeSuggestionIndex: index },
      //   this._announceSuggestion.bind(this, index));
    }
  };

  render() {
    const {
      children,
      disabled,
      dropAlign,
      dropBackground,
      dropTarget,
      forwardRef,
      justifyContent,
      icon,
      items,
      label,
      messages,
      onKeyDown,
      plain,
      size,
      theme,
      ...rest
    } = this.props;
    const { activeItemIndex, open } = this.state;

    const MenuIcon = theme.menu.icons.down;
    const iconColor = normalizeColor('control', theme);

    const content = children || (
      <Box
        direction="row"
        justify={justifyContent}
        align="center"
        pad="small"
        gap={label && icon !== false ? 'small' : undefined}
      >
        <Text size={size}>{label}</Text>
        {icon !== false
          ? (icon !== true && icon) || (
              <MenuIcon color={iconColor} size={size} />
            )
          : null}
      </Box>
    );

    const controlMirror = (
      <Box flex={false}>
        <Button
          a11yTitle={messages.closeMenu || 'Close Menu'}
          plain={plain}
          onClick={this.onDropClose}
        >
          {typeof content === 'function'
            ? props => content({ ...props, drop: true })
            : content}
        </Button>
      </Box>
    );

    return (
      <Keyboard
        onEnter={this.onSelectMenuItem}
        onSpace={this.onSelectMenuItem}
        onDown={this.onNextMenuItem}
        onUp={this.onPreviousMenuItem}
        onEsc={this.onDropClose}
        onTab={this.onDropClose}
        onKeyDown={onKeyDown}
      >
        <DropButton
          ref={forwardRef}
          {...rest}
          a11yTitle={messages.openMenu || 'Open Menu'}
          disabled={disabled}
          dropAlign={dropAlign}
          dropTarget={dropTarget}
          plain={plain}
          open={open}
          onOpen={() => this.setState({ open: true })}
          onClose={() => this.setState({ open: false })}
          dropContent={
            <ContainerBox background={dropBackground || theme.menu.background}>
              {dropAlign.top === 'top' ? controlMirror : undefined}
              <Box overflow="auto">
                {items.map((item, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Box key={index} flex={false}>
                    <Button
                      ref={ref => {
                        this.buttonRefs[index] = ref;
                      }}
                      active={activeItemIndex === index}
                      hoverIndicator="background"
                      disabled={item.disabled}
                      onClick={(...args) => {
                        item.onClick(...args);
                        if (item.close !== false) {
                          this.onDropClose();
                        }
                      }}
                      href={item.href}
                    >
                      <Box align="start" pad="small" direction="row">
                        {item.icon}
                        {item.label}
                      </Box>
                    </Button>
                  </Box>
                ))}
              </Box>
              {dropAlign.bottom === 'bottom' ? controlMirror : undefined}
            </ContainerBox>
          }
        >
          {content}
        </DropButton>
      </Keyboard>
    );
  }
}

Object.setPrototypeOf(Menu.defaultProps, defaultProps);

let MenuDoc;
if (process.env.NODE_ENV !== 'production') {
  MenuDoc = require('./doc').doc(Menu); // eslint-disable-line global-require
}
const MenuWrapper = compose(
  withTheme,
  withForwardRef,
)(MenuDoc || Menu);

export { MenuWrapper as Menu };

/* PropTypes for UXPinMerge */

Menu.propTypes = {
  a11yTitle: PropTypes.string,
  alignSelf: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  gridArea: PropTypes.string,
  margin: PropTypes.oneOf([
    'none',
    'xxsmall',
    'xsmall',
    'small',
    'medium',
    'large',
    'xlarge',
  ]),
  disabled: PropTypes.bool,
  dropAlign: PropTypes.shape({
    top: PropTypes.oneOf(['top', 'bottom']),
    bottom: PropTypes.oneOf(['top', 'bottom']),
    left: PropTypes.oneOf(['right', 'left']),
    right: PropTypes.oneOf(['right', 'left']),
  }),
  dropBackground: PropTypes.string,
  dropTarget: PropTypes.object,
  justifyContent: PropTypes.oneOf([
    'start',
    'center',
    'end',
    'between',
    'around',
    'stretch',
  ]),
  icon: PropTypes.oneOfType(PropTypes.string, PropTypes.object, PropTypes.node),
  items: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.node,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      closeMenu: PropTypes.string,
      openMenu: PropTypes.string,
    }),
  ),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
};

/* Export default for UXPin Merge */
export default Menu;
