import React, {forwardRef} from 'react'
import AntdInputNumber from 'antd/lib/input-number'
import range from 'lodash/fp/range'

const BACK_KEY_CODE = 8
const ENTER_KEY_CODE = 13
const DOT_KEY_CODE = 190
const NUMBER_KEY_CODES = range(48, 58)
const KEYPAD_KEY_CODES = range(96, 106)
const ARROWS_KEY_CODES = range(37, 41)
const INPUT_NUMBER_VALID_KEY_CODES = [
  ENTER_KEY_CODE,
  BACK_KEY_CODE,
  DOT_KEY_CODE,
  ...ARROWS_KEY_CODES,
  ...NUMBER_KEY_CODES,
  ...KEYPAD_KEY_CODES,
]

const InputNumber = forwardRef(({blurOnEnter, ...props}, ref) => {
  function handleInputNumberKeyDown(event) {
    if (event.keyCode === ENTER_KEY_CODE && blurOnEnter) {
      event.stopPropagation()
      event.currentTarget.blur()
    } else if (!INPUT_NUMBER_VALID_KEY_CODES.includes(event.keyCode)) {
      event.preventDefault()
    }
  }

  return <AntdInputNumber ref={ref} onKeyDown={handleInputNumberKeyDown} {...props} />
})

export default InputNumber
