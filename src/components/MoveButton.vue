<template>
  <div class="container h-full flex flex-col justify-center">
    <div>
      <el-button
        size="mini"
        icon="el-icon-upload2"
        class="bg-slate-50"
        :disabled="!canMoveUp"
        @click="moveTop"
      ></el-button>
    </div>
    <div>
      <el-button
        size="mini"
        icon="el-icon-top"
        class="bg-slate-50"
        :disabled="!canMoveUp"
        @click="moveUp"
      ></el-button>
    </div>
    <div>
      <el-button
        size="mini"
        icon="el-icon-bottom"
        class="bg-slate-50"
        :disabled="!canMoveDown"
        @click="moveDown"
      ></el-button>
    </div>
    <div>
      <el-button
        size="mini"
        icon="el-icon-download"
        class="bg-slate-50"
        :disabled="!canMoveDown"
        @click="moveBottom"
      ></el-button>
    </div>
  </div>
</template>
<script>
const getArrayFromTreeByItem = (tree, item, childrenId) => {
  if (!tree || !item || !childrenId) return []
  for (let i = 0; i < tree.length; i++) {
    const _item = tree[i]
    if (_item === item) {
      return tree
    }
    const children = _item[childrenId]
    if (children && children.length > 0) {
      const result = getArrayFromTreeByItem(children, item, childrenId)
      if (result) {
        return result
      }
    }
  }
}

export default {
  name: 'MoveButton',
  props: {
    list: {
      type: Array
    },
    item: {
      type: Object
    },
    customMove: {
      type: Function
    },
    childrenId: {
      type: String
    }
  },
  data() {
    return {}
  },
  computed: {
    canMoveUp() {
      const { list, item, getArrayFromTreeByItem } = this
      const array = getArrayFromTreeByItem(list, item)
      return item && array[0] !== item
    },
    canMoveDown() {
      const { list, item, getArrayFromTreeByItem } = this
      const array = getArrayFromTreeByItem(list, item)
      return item && array[array.length - 1] !== item
    }
  },
  methods: {
    getArrayFromTreeByItem(tree, item) {
      return getArrayFromTreeByItem(tree, item, this.childrenId)
    },
    moveToEdge(type) {
      const { list, item, getArrayFromTreeByItem } = this
      const array = getArrayFromTreeByItem(list, item)
      const index = array.indexOf(item)
      array.splice(index, 1)
      if (type === 'top') {
        array.unshift(item)
      } else {
        array.push(item)
      }
      this.$emit('move', list)
    },
    moveByStep(d) {
      const { list, item, getArrayFromTreeByItem } = this
      const array = getArrayFromTreeByItem(list, item)
      const index = array.indexOf(item)
      const targetIndex = index + d
      const temp = array[targetIndex]
      this.$set(array, targetIndex, item)
      this.$set(array, index, temp)
      this.$emit('move', list)
    },
    moveTop() {
      this.moveToEdge('top')
    },
    moveUp() {
      this.moveByStep(-1)
    },
    moveDown() {
      this.moveByStep(1)
    },
    moveBottom() {
      this.moveToEdge('bottom')
    }
  }
}
</script>
<style scoped></style>
