import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		options: {
			ddv: 80,
			pr: 0.075,
			pmn: 5500,
			bs: 2,
			es: 8,
			pl: 200000
		}
	},
	mutations: {
		UPDATE_OPTIONS (state, { type, order, option }) {
			if (option === 'increment') {
				state.options[type] += parseFloat(order)
			} else if (option === 'decrement' && state.options[type] > 0) {
				state.options[type] -= parseFloat(order)
			}
		}
	},
	actions: {
		updateOptions ({ commit }, obj) {
			commit('UPDATE_OPTIONS', obj)
		}
	}
})