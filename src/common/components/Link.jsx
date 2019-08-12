import React from 'react'
import Button from 'antd/es/button'
import {Link as RouterLink} from 'react-router-dom'
import noop from 'lodash/fp/noop'

function Link({className = '', style = {}, to = '#', onClick = noop, children}) {
  const customStyle = {padding: 0, height: 'inherit', lineHeight: 'inherit', ...style}

  return to.startsWith('/') ? (
    <RouterLink to={to} onClick={onClick}>
      <Button type="link" className={className} style={customStyle}>
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
    >
      {children || to}
    </Button>
  )
}

export default Link
