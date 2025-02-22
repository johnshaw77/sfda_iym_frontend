// TODO: check this file, no use

import { defineStore } from 'pinia';

export const useNodeStore = defineStore('node', {
  state: () => ({
    nodeTypes: [],
    nodeCategories: [],
  }),
  actions: {
    setNodeTypes(nodeTypes) {
      this.nodeTypes = nodeTypes;
    },
    setNodeCategories(nodeCategories) {
      this.nodeCategories = nodeCategories;
    },
  },
  getters: {
    getNodeTypes: (state) => state.nodeTypes,
    getNodeCategories: (state) => state.nodeCategories,
  },
}); 