with(this) {
    return _c("div", null, null, [(data.show) ? _c("p", null, null, [_t("我是通过v-if=\"data.show\"判断要显示的")], false) : (_c("p", null, {
        "v-else": null
    }, [_t("我是通过v-if判断要隐藏的")], false)), (!data.show) ? _c("p", null, null, [_t("我是通过\'v-if\'=\"data.show\"判断要隐藏的")], false) : ((data.show2) ? _c("p", null, {
        "v-else-if": data.show2
    }, [_t("我是通过v-else-if=\"data.show2\"\'判断要显示的")], false) : (_c("p", null, {
        "v-else": null
    }, [_t("我是通过v-\"else\"判断要显示的 " + (data.show2 ? 'ddd' : 'ewww') + "")], false)))], true)
}