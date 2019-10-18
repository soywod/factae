import React from 'react'
import {useSpring, animated, config} from 'react-spring'
import Icon from 'antd/lib/icon'
import Spin from 'antd/lib/spin'

function Title({label, loading = false, children = null}) {
  const style = useSpring({opacity: loading ? 1 : 0, config: config.wobbly})
  const pointerEvents = loading ? 'all' : 'none'

  return (
    <div className="title-container">
      <h1 className="title-content-container">
        <span className="title-content">{label}</span>
        {children}
      </h1>

      <animated.div className="title-loader" style={{...style, pointerEvents}}>
        <Spin indicator={<Icon type="sync" className="loader" spin />} spinning />
      </animated.div>
    </div>
  )
}

export default Title
