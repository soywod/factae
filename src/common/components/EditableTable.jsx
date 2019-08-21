import React from 'react'
import Table from 'antd/es/table'
import Input from 'antd/es/input'
import InputNumer from 'antd/es/input-number'
import Form from 'antd/es/form'
import isNumber from 'lodash/fp/isNumber'
import range from 'lodash/fp/range'

const BACK_KEY_CODE = 8
const ENTER_KEY_CODE = 13
const DOT_KEY_CODE = 190
const NUMBER_KEY_CODES = range(48, 58)
const KEYPAD_KEY_CODES = range(96, 106)
const ARROWS_KEY_CODES = range(37, 41)
const INPUT_NUMBER_VALID_KEY_CODES = [
  BACK_KEY_CODE,
  DOT_KEY_CODE,
  ...ARROWS_KEY_CODES,
  ...NUMBER_KEY_CODES,
  ...KEYPAD_KEY_CODES,
]

const EditableContext = React.createContext()

const EditableRow = ({form, index, ...props}) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
)

const EditableFormRow = Form.create()(EditableRow)

class EditableCell extends React.Component {
  state = {
    editing: false,
  }

  toggleEdit = () => {
    const editing = !this.state.editing
    this.setState({editing}, () => {
      if (editing) {
        this.input.focus()
      }
    })
  }

  handleKeyDown = event => {
    if (event.keyCode === ENTER_KEY_CODE) {
      event.stopPropagation()
      event.currentTarget.blur()
    } else if (!INPUT_NUMBER_VALID_KEY_CODES.includes(event.keyCode)) {
      event.preventDefault()
    }
  }

  save = event => {
    const {record, handleSave} = this.props
    this.form.validateFields((error, values) => {
      if (error && error[event.currentTarget.id]) {
        return
      }
      this.toggleEdit()
      handleSave({...record, ...values})
    })
  }

  renderCell = form => {
    this.form = form
    const {children, dataIndex, record} = this.props
    const {editing} = this.state
    return editing ? (
      <Form.Item style={{margin: 0, padding: 0}}>
        {form.getFieldDecorator(dataIndex, {
          initialValue: record[dataIndex],
        })(
          isNumber(record[dataIndex]) ? (
            <InputNumer
              size="large"
              ref={node => (this.input = node)}
              min={0}
              step={1}
              onKeyDown={this.handleKeyDown}
              onBlur={this.save}
              style={{width: '100%', height: 42}}
            />
          ) : (
            <Input
              size="large"
              ref={node => (this.input = node)}
              onPressEnter={this.save}
              onBlur={this.save}
              style={{width: '100%', height: 42}}
            />
          ),
        )}
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" onClick={this.toggleEdit}>
        {children}
      </div>
    )
  }

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props

    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    )
  }
}

function EditableTable({onSave: handleSave, dataSource, ...props}) {
  const components = {
    body: {
      row: EditableFormRow,
      cell: EditableCell,
    },
  }

  const columns = props.columns.map(col => {
    if (!col.editable) {
      return col
    }

    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    }
  })

  return (
    <Table
      {...props}
      columns={columns}
      dataSource={dataSource}
      components={components}
      rowClassName={() => 'editable-row'}
    />
  )
}

export default EditableTable
