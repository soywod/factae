import React from 'react'
import Button from 'antd/es/button'
import {Link as RouterLink} from 'react-router-dom'
import noop from 'lodash/fp/noop'

function Link({className = '', style = {}, to = '#', onClick = noop, children, ...props}) {
  const customStyle = {padding: 0, height: 'inherit', lineHeight: 'inherit', ...style}

  return to.startsWith('/') ? (
    <RouterLink to={to} onClick={onClick} tabIndex={-1}>
      <Button className={className} type="link" style={customStyle} {...props}>
        {children}
      </Button>
    </RouterLink>
  ) : (
    <Button
      type="link"
      className={className}
      style={customStyle}
      href={to}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children || to}
    </Button>
  )
}

export default Link
