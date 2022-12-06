/**
 * 获取地址栏参数
 * @param name
 * @returns {any}
 */
export function getQueryString(name) {
  const searchStr = window.location.search.substr(1) || window.location.hash.split('?')[1] || ''
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  const r = searchStr.match(reg)
  return r ? decodeURIComponent(r[2]) : null
}

/**
 * 深拷贝
 * @param source
 * @returns {any|RegExp|Date}
 */
export function deepClone(source) {
  if (!source) {
    return source
  }
  if (source.constructor === Date) {
    return new Date(source) // 日期对象直接返回一个新的日期对象
  }
  if (source.constructor === RegExp) {
    return new RegExp(source) // 正则对象直接返回一个新的正则对象
  }
  const sourceClone = source instanceof Array ? [] : {}
  for (const item in source) {
    // eslint-disable-next-line no-prototype-builtins,no-continue
    if (!source.hasOwnProperty(item)) continue
    sourceClone[item] = typeof source[item] === 'object' ? deepClone(source[item]) : source[item]
  }
  return sourceClone
}

/**
 * 是否为数字
 * @param val
 * @returns {boolean}
 */
export function isNumber(val) {
  const regPos = /^\d+(\.\d+)?$/ // 非负浮点数
  const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/ // 负浮点数
  return regPos.test(val) || regNeg.test(val)
}

/**
 * 时间格式化
 * @param date
 * @param format
 * @returns {string}
 */
export function formatDate(date, format = 'yyyy-MM-dd') {
  if (!date) {
    return ''
  }
  date = new Date(isNumber(date) ? new Date(Number(date)) : date)
  if (!isNaN(date)) {
    const newDate = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'S+': date.getMilliseconds()
    }
    if (/(y+)/i.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (const k in newDate) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length === 1
          ? newDate[k]
          : ('00' + newDate[k]).substr(('' + newDate[k]).length))
      }
    }
    return format
  }
  return ''
}

/**
 * 日期转时间戳
 * @param date
 * @param unit
 * @returns {any}
 */
export function dateToTimer(date, unit = 's') {
  if (unit === 's') {
    return date ? new Date(date).getTime() / 1000 : ''
  } else {
    return date ? new Date(date).getTime() : ''
  }
}

/**
 * 空校验
 * @param value
 * @returns {boolean|boolean}
 */
export function emptyFormRule(value) {
  return value !== 0 && !value
}

/**
 * 扁平结构转树形结构
 * @param items
 * @param idKey
 * @param parentIdKey
 * @param filterType
 * @returns {[]}
 */
export function arrayToTree(items, idKey, parentIdKey, filterType = '') {
  const result = [] // 存放结果集
  const itemMap = {} //
  for (const item of items) {
    const id = item[idKey]
    const parentId = item[parentIdKey]

    if (!itemMap[id]) {
      itemMap[id] = {
        children: []
      }
    }

    itemMap[id] = {
      ...item,
      children: itemMap[id].children
    }

    const treeItem = itemMap[id]

    if (!parentId || parentId === -1) {
      result.push(treeItem)
    } else {
      if (!itemMap[parentId]) {
        itemMap[parentId] = {
          children: []
        }
      }

      // 处理资源上级菜单树时，不添加button类型
      if (filterType !== treeItem.type) {
        itemMap[parentId].children.push(treeItem)
      }
    }
  }
  return result
}

/**
 * 过滤空参数
 * @param params
 * @returns {{}|*}
 */
export function filter_null(params) {
  if (!params) {
    return {}
  }
  for (const key in params) {
    // eslint-disable-next-line no-prototype-builtins
    if (params.hasOwnProperty(key)) {
      if (!params[key] && typeof params[key] !== 'boolean' && params[key] !== 0) {
        delete params[key]
      } else if (typeof params[key] === 'string' && params[key].length <= 0) {
        delete params[key]
      }
    }
  }
  return params
}
