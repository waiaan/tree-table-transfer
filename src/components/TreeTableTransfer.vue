<template>
  <div class="tree-table-transfer h-2/3 container mx-auto flex mt-10">
    <div class="w-1/4 h-full tree-selector border mr-10 rounded">
      <div class="py-2.5 pl-7 bg-f5-f7fa">
        <el-checkbox v-model="isSelectedAll" @change="onSelectAllChange">
          {{ selectAllLabel }}
        </el-checkbox>
      </div>
      <div class="p-2.5" style="height: calc(100% - 44px)">
        <vxe-input
          v-model="searchWord"
          type="search"
          clearable
          className="w-full"
        ></vxe-input>
        <div
          class="container mt-5 overflow-auto"
          style="height: calc(100% - 50px)"
        >
          <el-tree
            :data="treeData"
            ref="tree"
            v-bind="elTreeOptions"
            :filter-node-method="filterMethod"
            :default-checked-keys="defaultCheckedKeys"
            @check="onTreeCheck"
          ></el-tree>
        </div>
      </div>
    </div>
    <div class="w-3/4 h-full table-viewer">
      <vxe-grid
        ref="xGrid"
        v-bind="tableOptions"
        @current-change="onCurrentRowChange"
        @menu-click="onContextMenuClick"
      ></vxe-grid>
    </div>
    <div class="w-5 h-full move-button">
      <move-button
        :list="currentTableArray"
        :item="currentTableRow"
        :children-id="childrenId"
        @move="onMoveTableRow"
      ></move-button>
    </div>
  </div>
</template>

<script>
import MoveButton from '@/components/MoveButton'
const merge = require('deepmerge')

const DEFAULT_GRID_OPTIONS = {
  border: true,
  round: true,
  height: 'auto',
  data: [],
  keepSource: true,
  showOverflow: true,
  rowConfig: {
    isCurrent: true,
    isHover: true
  },
  menuConfig: {
    body: {
      options: [
        [
          {
            code: 'delete',
            name: 'delete'
          }
        ]
      ]
    }
  }
}

const DEFAULT_TREE_OPTIONS = {
  showCheckbox: true
}

const flatTree = (tree, childrenId, isLeafOnly) => {
  let arr = tree.slice(0)
  const result = []
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    let hasChildren = false
    if (item[childrenId] && item[childrenId].length > 0) {
      arr = arr.concat(item[childrenId])
      hasChildren = true
    }
    if (isLeafOnly && !hasChildren) {
      result.push(item)
    }
    if (!isLeafOnly) {
      result.push(item)
    }
  }
  return result
}

const getArrayIds = (arr, id) => {
  return arr.map(item => item[id])
}

const getTreeIds = (tree, id, childrenId, isLeafOnly) => {
  if (!tree || tree.length === 0) return []
  if (!id) {
    throw new Error('id is required')
  }
  if (!childrenId) {
    throw new Error('childrenId is required')
  }
  return getArrayIds(flatTree(tree, childrenId, isLeafOnly), id)
}

const syncArray = (checked, onShow, id) => {
  const checkedIds = getArrayIds(checked, id)
  const onShowIds = getArrayIds(onShow, id)
  for (let i = 0; i < checked.length; i++) {
    const item = checked[i]
    const _id = item[id]
    if (onShowIds.indexOf(_id) < 0) {
      onShow.push(item)
    }
  }
  for (let i = onShow.length - 1; i >= 0; i--) {
    const item = onShow[i]
    const _id = item[id]
    if (checkedIds.indexOf(_id) < 0) {
      onShow.splice(i, 1)
    }
  }
}

const arrayToTree = (arr, id, pid, childrenId) => {
  const tree = []
  const map = {}
  for (let i = 0; i < arr.length; i++) {
    const _id = arr[i][id]
    arr[i][childrenId] = []
    if (map[_id]) {
      throw new Error('id ' + _id + ' is duplicate')
    } else {
      map[_id] = arr[i]
    }
  }
  for (let i = 0; i < arr.length; i++) {
    const _pid = arr[i][pid]
    if (!_pid) {
      tree.push(arr[i])
    } else {
      map[_pid][childrenId].push(arr[i])
    }
  }
  return tree
}

export default {
  name: 'TreeTableTransfer',
  components: {
    MoveButton
  },
  props: {
    selectAllLabel: {
      type: String,
      default: 'All'
    },
    treeProps: {
      type: Object
    },
    data: {
      type: Array,
      default: function () {
        return []
      }
    },
    defaultSelectedData: {
      type: Array,
      default: function () {
        return []
      }
    },
    treeOptions: {
      type: Object
    },
    gridOptions: {
      type: Object
    }
  },
  data() {
    return {
      isSelectedAll: false,
      searchWord: '',
      treeData: [],
      loading: false,
      tableOptions: {},
      elTreeOptions: {},
      defaultCheckedKeys: [],
      currentTableRow: null,
      currentTableArray: null
    }
  },
  watch: {
    searchWord(val) {
      this.$refs.tree.filter(val)
    },
    treeOptions: {
      handler(val) {
        this.elTreeOptions = Object.assign(
          {},
          merge(this.defaultTreeOptions, val)
        )
      },
      immediate: true
    },
    gridOptions: {
      handler(val) {
        this.tableOptions = Object.assign(
          {},
          merge(this.defaultGridOptions, val)
        )
      },
      immediate: true
    },
    data: {
      handler(val) {
        this.onDataChange(val)
      },
      immediate: true
    },
    defaultSelectedData: {
      handler(val) {
        this.setDefaultSelectedData(val)
      },
      immediate: true
    }
  },
  computed: {
    defaultTreeOptions() {
      return merge(DEFAULT_TREE_OPTIONS, {
        nodeKey: this.nodeId,
        props: {
          children: this.childrenId
        }
      })
    },
    defaultGridOptions() {
      return merge(DEFAULT_GRID_OPTIONS, {
        rowConfig: {
          keyField: this.nodeId
        },
        treeConfig: {
          rowField: this.nodeId,
          parentField: this.nodePid,
          children: this.childrenId
        }
      })
    },
    nodeDisabledFunc() {
      return this.treeOptions.props.disabled || (() => false)
    },
    nodeId() {
      return this.treeProps.nodeId || 'id'
    },
    nodePid() {
      return this.treeProps.nodePid || 'pid'
    },
    childrenId() {
      return this.treeProps.childrenId || 'children'
    },
    dataIds() {
      return this.getTreeIds(this.treeData)
    }
  },
  methods: {
    arrayToTree(arr) {
      return arrayToTree(arr, this.nodeId, this.nodePid, this.childrenId)
    },
    syncArray(checked, onShow) {
      syncArray(checked, onShow, this.nodeId)
    },
    getTreeIds(tree, isLeafOnly) {
      return getTreeIds(tree, this.nodeId, this.childrenId, isLeafOnly)
    },
    filterMethod(value, data, node) {
      if (value === '') return true
      return node.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    onDataChange(val) {
      this.treeData = [].concat(val)
    },
    setDefaultSelectedData(data) {
      const { $refs, onGridReloadData, setDefaultSelectedData, $nextTick } =
        this
      const { tree, xGrid } = $refs
      if (!tree || !xGrid) {
        $nextTick(() => {
          setDefaultSelectedData(data)
        })
      } else {
        onGridReloadData(data)
        this.defaultCheckedKeys = this.getTreeIds(data, true)
      }
    },
    onGridReloadData(data) {
      return new Promise(resolve => {
        this.$refs.xGrid.reloadData(data).then(() => {
          resolve(data)
        })
      })
    },
    onSelectAllChange(val) {
      const { $refs, dataIds, nodeDisabledFunc, asyncCheckedData } = this
      const { tree } = $refs
      dataIds.forEach(id => {
        const node = tree.getNode(id)
        if (!nodeDisabledFunc(node.data)) {
          tree.setChecked(id, val)
        }
      })
      asyncCheckedData()
    },
    onTreeCheck(
      data,
      { checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKeys }
    ) {
      const {
        $refs,
        childrenId,
        syncArray,
        arrayToTree,
        getSelectedData,
        dataIds
      } = this
      const { xGrid } = $refs
      this.isSelectedAll = dataIds.length === checkedKeys.length
      const tableData = flatTree(getSelectedData(), childrenId)
      const checkedData = checkedNodes.concat(halfCheckedNodes)
      syncArray(merge([], checkedData), tableData)
      xGrid.loadData(arrayToTree(tableData))
    },
    getSelectedData() {
      return this.$refs.xGrid.getTableData().fullData
    },
    onCurrentRowChange({ row }) {
      const { getSelectedData } = this
      this.currentTableRow = row
      this.currentTableArray = getSelectedData()
    },
    onMoveTableRow(newData) {
      this.$refs.xGrid.loadData(newData)
    },
    asyncCheckedData() {
      const { $refs, onTreeCheck } = this
      const { tree } = $refs
      const checkedNodes = tree.getCheckedNodes()
      const halfCheckedNodes = tree.getHalfCheckedNodes()
      const checkedKeys = tree.getCheckedKeys()
      onTreeCheck([], { checkedNodes, checkedKeys, halfCheckedNodes })
    },
    onContextMenuClick({ menu, row }) {
      const { $refs, nodeId, asyncCheckedData } = this
      const { tree } = $refs
      if (menu.code === 'delete') {
        const id = row[nodeId]
        tree.setChecked(id, false, true)
        this.isSelectedAll = false
        asyncCheckedData()
      }
    }
  }
}
</script>
