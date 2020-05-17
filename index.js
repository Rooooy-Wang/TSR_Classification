'use strict'
$(document).ready(function () {
    var panel_2 = $(".panel-2")
    var form_style = $("#form_style");
    var panel_1 = $(".panel-1");
    var panel_3 = $(".panel-3");
    var image_file = $("#image_file");
    var Rc = $("#Rc");
    var Is = $("#Is");
    var rock_type = $("#rock_type");
    var roughness = $("#roughness");
    var rocktype = $("#rocktype");
    var weathering = $("#weathering");
    var Kv = $("#Kv");
    var Jv = $("#Jv");
    var Si = $("#Si");
    var S0 = $("#S0");
    var completeness = $("#completeness");
    var dev_struc_plane = $("#dev_struc_plane");
    var num_struc_plane = $("#num_struc_plane");
    var spacing_struc_plane = $("#spacing_struc_plane");
    var integration = $("#integration");
    var K1 = $("#K1");
    var p = $("#p");
    var Q = $("#Q");
    var mositure_content = $("#mositure_content");
    var K2 = $("#K2");
    var included_angle = $("#included_angle");
    var dip_angle = $("#dip_angle");
    var K3 = $("#K3");
    var sigma_max = $("#sigma_max");
    var submit = $("#submit");
    var fc = $("#first_classification")
    var panel_2_state = "danger";
    var panel_3_state = "warning";
    var bq = 0;
    var fir_qua = 0;
    var fir_quan = 0;
    var cor_bq = 0;
    var sec_quan = 0;
    var sec_qua = 0;

    function bq_leveling(x) {
        if (x>550) {return 1;
        } else if (x>=451) {return 2;
        } else if (x>=351) {return 3;
        } else if (x>=251) {return 4;
        } else {return 5;}
    }

    function dip(x_list, y_list) {
        var dip_list = [];
        for (var i = 0; i <= x_list.length - 2; i++) {
            dip_list.push((y_list[i + 1] - y_list[i]) / (x_list[i + 1] - x_list[i]));
        }
        return dip_list;
    }

    function linear_interpolation(x, spacing, x_list, y_list) {
        //使用线性插值法来计算y的值
        var dip_list = dip(x_list, y_list);
        var y;
        if (spacing === y_list.length) {
            y = y_list[spacing - 1] + (x - y_list[spacing - 1]) * dip_list[spacing - 2];
        } else if (spacing === 0) {
            y = y_list[spacing] - (y_list[spacing] - x) * dip_list[spacing];
        } else {
            y = y_list[spacing - 1] + (y_list[spacing - 1] - x) * dip_list[spacing - 1];
        }
        if (y > 0) {
            return y;
        } else {
            return 0;
        }
    }

    function correction(bq) {
        cor_bq = bq - 100*(K1.val()+K2.val()+K3.val());
        sec_quan = bq_leveling(cor_bq);
    }

    function tf_processing() {
        // 触发所有mode-hide的change事件
        // 重新审视panel-2和panel-3
    }

    function review_panel_2() {
        if (Rc.val() !== "" && Kv.val() !== "") {
            if (roughness.val() !== "false" && completeness.val() !== "false") {
                return "success";
            } else {
                return "warning";
            }
        } else {
            return "danger";
        }
    }

    function review_panel_3() {
        if (K1.val() !== "" && K2.val() !== "" && K3.val() !== "" && fc.val() !== "") {
            return "success";
        } else {
            return "warning"
        }
    }

    function change_panel_2() {
        // 首先移除旧的格式
        if (panel_2_state === "danger") {
            panel_2.removeClass("panel-danger");
        } else if (panel_2_state === "success") {
            panel_2.removeClass("panel-success");
        } else {
            panel_2.removeClass("panel-warning");
        }
        var now_state = review_panel_2()
        if (now_state === "success") {
            //定量分级-得到fc
            var rc = Rc.val();
            var kv = Kv.val();
            if (rc>(90*kv+30)){
                rc = 90*kv+30;
            } else if (kv>0.04*rc+0.4) {
                kv=0.04*rc+0.4;
            }
            bq = 100+3*rc+250*kv;
            fir_quan = bq_leveling(bq)
            fc.val(fir_quan)
            //定性分级
            var table_quantitative =[[1, 2, 3, 4, 5], [2, 3, 4, 4, 5], [3, 4, 4, 5, 5], [4, 4, 5, 5, 5], [5, 5, 5, 5, 5]];
            fir_qua = table_quantitative[roughness.val()-1][completeness.val()-1]
            //更新panel_2的状态
            panel_2.addClass("panel-success");
            panel_2_state = "success";
        } else if (now_state === "warning") {
            //定量分级,得到fc
            var rc = Rc.val();
            var kv = Kv.val();
            if (rc>(90*kv+30)){
                rc = 90*kv+30;
            } else if (kv>0.04*rc+0.4) {
                kv=0.04*rc+0.4;
            }
            bq = 100+3*rc+250*kv;
            fir_quan = bq_leveling(bq);
            fc.val(fir_quan);
            //更新panel_2的状态
            panel_2.addClass("panel-warning");
            panel_2_state = "warning";
        } else {
            //清空fc,
            fc.val("");
            //更新panel_2的状态
            panel_2.addClass("panel-danger");
            panel_2_state = "danger";
        }
    }

    function change_panel_3() {
        // 首先移除旧的格式
        if (panel_3_state === "success") {
            panel_3.removeClass("panel-success");
        } else {
            panel_3.removeClass("panel-warning");
        }
        if (review_panel_3() === "success") {
            //更新panel_3的状态
            panel_3.addClass("panel-success");
            panel_3_state = "success";
        } else {
            //更新panel_3的状态
            panel_3.addClass("panel-warning");
            panel_3_state = "warning";
        }
    }

    // 变量初始化
    // form_style行为:
    form_style.change(function () {
        if (form_style.val() === "2") {
            //精简模式
            $(".mode-hide").hide();
            $(".mode-wutu").show();
            panel_1.removeClass("panel-success");
            panel_1.addClass("panel-danger");
        } else if (form_style.val() === "1") {
            //标准模式
            $('.mode-hide').show();
            $(".mode-wutu").show();
            panel_1.removeClass("panel-success");
            panel_1.addClass("panel-danger");
        } else {
            //无图模式
            $('.mode-hide').show();
            $(".mode-wutu").hide();
            panel_1.removeClass("panel-danger");
            panel_1.addClass("panel-success");
        }
        //对图片进行reset
        image_file.val("");
        //其实本来是应该重置所有自动生成的参数的.
    });
    // image_file行为:
    image_file.change(function () {
        //首先判断是清空了文件域还是上传了新文件
        //检查一下传入文件的格式和大小, 如果有问题, 就直接清空
        //检查一下panel-1是否有变化
        panel_1.removeClass("panel-danger");
        panel_1.addClass("panel-success");
        //开始使用tensorlow.js进行识别
        tf_processing();
    });
    // Rc行为:
    Rc.change(function () {
        if (Rc.val() === "") {
            //解冻组内变量
            $("#Is,#rock_type").attr("disabled", false);
            //解冻并置空K3
            K3.attr("disabled", false);
            K3.val("")
        } else if (sigma_max.val() === "") {
            //冻结组内变量
            $("#Is,#rock_type").attr("disabled", true);
        } else {
            //冻结组内和K3变量
            $("#Is,#rock_type,#K3").attr("disabled", true);
            //计算K3变量
            K3.val("6");
        }
        //验证本面板的颜色
        change_panel_2()
        change_panel_3()
    });
    // Is行为:
    Is.change(function () {
        if (Is.val() === "") {
            // 清空上级变量
            Rc.val("");
            // 解冻组内变量
            $("#Rc,#rock_type").attr("disabled", false);
        } else {
            // 计算上级变量
            Rc.val(22.82 * Is.val() ^ 0.75);
            // 冻结组内变量
            $("#Rc,#rock_type").attr("disabled", true);
        }
        change_panel_2()
    });
    // rock_type行为:
    rock_type.change(function () {
        if (rock_type.val() === "false") {
            Rc.val("");
            $("#Rc,#Is").attr("disabled", false);
        } else {
            // 计算Rc的值,并冻结(未完成)
            Rc.val("5");
            $("#Rc,#Is").attr("disabled", true);
        }
        change_panel_2()
    });
    // roughness行为:
    roughness.change(function () {
        if (roughness.val() === "false") {
            // 解冻其余参数
            $("#rocktype,#weathering").attr("disabled", false);
        } else {
            // 冻结其余参数
            $("#rocktype,#weathering").attr("disabled", true);
        }
        change_panel_2()
    });
    // rocktype, weathering行为:
    $("#rocktype,#weathering").change(function () {
        if (rocktype.val() === "false" && weathering.val() === "false") {
            // 清空上级变量
            roughness.val("false")
            // 解冻组内变量
            roughness.attr("disabled", false);
        } else if (rocktype.val() !== "false" && weathering.val() !== "false") {
            // 计算上级变量
            var table_2roughness = [[1, 1, 2, 3, 5], [2, 2, 3, 4, 5], [3, 3, 4, 5, 5], [4, 5, 5, 5, 5], [5, 5, 5, 5, 5]];
            roughness.val(table_2roughness[$("#rocktype").val() - 1][$("#weathering").val() - 1])
            // 冻结组内变量
            roughness.attr("disabled", true);
        } else {
            // 冻结组内变量
            roughness.attr("disabled", true);
        }
        change_panel_2()
    });
    // Kv行为;
    Kv.change(function () {
        if (Kv.val() === "") {
            // 解冻其余变量
            $("#Jv,#Si,#S0").attr("disabled", false);
        } else {
            // 冻结其余变量
            $("#Jv,#Si,#S0").attr("disabled", true);
        }
        change_panel_2()
    });
    // Jv行为;
    Jv.change(function () {
        if (Jv.val() === "") {
            // 清空上级变量
            Kv.val("")
            // 解冻其余变量
            $("#Kv,#Si,#S0").attr("disabled", false);
        } else {
            // 计算上级变量
            var x_list = [3, 10, 20, 35];
            var y_list = [0.75, 0.55, 0.35, 0.15];
            if (Jv.val() < 3) {
                Kv.val(linear_interpolation(Jv.val(), 0, x_list, y_list));
            } else if (Jv.val() < 10) {
                Kv.val(linear_interpolation(Jv.val(), 1, x_list, y_list));
            } else if (Jv.val() < 20) {
                Kv.val(linear_interpolation(Jv.val(), 2, x_list, y_list));
            } else if (Jv.val() < 35) {
                Kv.val(linear_interpolation(Jv.val(), 3, x_list, y_list));
            } else {
                Kv.val(linear_interpolation(Jv.val(), 4, x_list, y_list));
            }
            // 清空组内变量
            $("#Si,#S0").val("");
            // 冻结组内变量
            $("#Kv,#Si,#S0").attr("disabled", true);
        }
        change_panel_2()
    });
    // Si, S0行为;
    $("#Si,#S0").change(function () {
        if (Si.val() === "" && S0.val() === "") {
            // 清零上级变量
            Kv.val("");
            Jv.val("");
            // 解冻组内变量
            $("#Kv,#Jv").attr("disabled", false);
        } else if (Si.val() !== "" && S0.val() !== "") {
            // 计算上级变量
            Jv.val(eval(Si.val().split("#").join("+")) + Number(S0.val()));
            var x_list = [3, 10, 20, 35];
            var y_list = [0.75, 0.55, 0.35, 0.15];
            if (Jv_val < 3) {
                Kv.val(linear_interpolation(Jv_val, 0, x_list, y_list));
            } else if (Jv_val < 10) {
                Kv.val(linear_interpolation(Jv_val, 1, x_list, y_list));
            } else if (Jv_val < 20) {
                Kv.val(linear_interpolation(Jv_val, 2, x_list, y_list));
            } else if (Jv_val < 35) {
                Kv.val(linear_interpolation(Jv_val, 3, x_list, y_list));
            } else {
                Kv.val(linear_interpolation(Jv_val, 4, x_list, y_list));
            }
            // 冻结组内变量
            $("#Kv,#Jv").attr("disabled", true);
        } else {
            // 冻结组内变量
            $("#Kv,#Jv").attr("disabled", true);
        }
        change_panel_2()
    });
    // completeness行为:
    completeness.change(function () {
        if (completeness.val() === "false") {
            // 解冻其余变量
            $("#dev_struc_plane,#num_struc_plane,#spacing_struc_plane,#integration").attr("disabled", false);
        } else {
            // 冻结其余变量
            $("#dev_struc_plane,#num_struc_plane,#spacing_struc_plane,#integration").attr("disabled", true);
        }
        change_panel_2()
    });
    // dev_struc_plane, num_struc_plane, spacing_struc_plane, integration行为:
    $("#num_struc_plane,#spacing_struc_plane").change(function () {
        if (num_struc_plane.val() !== "" && spacing_struc_plane.val() !== "") {
            //计算上级变量
            //冻结上级变量
            if (spacing_struc_plane.val() > 1) {
                if (num_struc_plane.val() >= 1 && num_struc_plane.val() <= 2) {
                    dev_struc_plane.val(1);
                } else {
                    dev_struc_plane.val(5);
                }
            } else if (spacing_struc_plane.val() > 0.4) {
                if (num_struc_plane.val() >= 2 && num_struc_plane.val() <= 3) {
                    dev_struc_plane_val.val(2);
                } else {
                    dev_struc_plane.val(5);
                }
            } else if (spacing_struc_plane.val() > 0.2) {
                if (num_struc_plane.val() >= 3) {
                    dev_struc_plane.val(3);
                } else {
                    dev_struc_plane.val(5);
                }
            }
            dev_struc_plane.attr("disabled", true);
            completeness.attr("disabled", true);
            if (integration.val() !== "false") {
                //计算上级变量
                var table_completeness = [[1, 1, 2, 3], [2, 2, 3, 4], [3, 3, 4, 4], [3, 4, 4, 5], [4, 4, 5, 5]];
                completeness.val(table_completeness[dev_struc_plane.val() - 1][integration.val() - 1]);
            }
        } else if (num_struc_plane.val() === "" && spacing_struc_plane.val() === "") {
            //两个都是空值
            //解冻上级变量
            dev_struc_plane.attr("disabled", false);
            if (integration.val() === "false") {
                //解冻completeness
                completeness.attr("disabled", false);
            }
        } else {
            //只有一个是空值
            //冻结上级变量
            dev_struc_plane.attr("disabled", true);
            completeness.attr("disabled", true);
        }
    })
    // dev_struc_plane行为:
    $("#dev_struc_plane,#integration").change(function () {
        if (dev_struc_plane.val() === "false" && integration.val() === "false") {
            //解冻上级变量
            completeness.attr("disabled", false);
            //解冻下级变量
            num_struc_plane.attr("disabled", false);
            spacing_struc_plane.attr("disabled", false);
        } else if (integration.val() !== "false") {
            //冻结上级变量
            completeness.val("false");
            completeness.attr("disabled", true);
            if (dev_struc_plane.val() !== "false") {
                //计算上级变量
                var table_completeness = [[1, 1, 2, 3], [2, 2, 3, 4], [3, 3, 4, 4], [3, 4, 4, 5], [4, 4, 5, 5]];
                completeness.val(table_completeness[Number(dev_struc_plane.val()) - 1][Number(integration.val()) - 1]);
                //冻结下级变量
                num_struc_plane.attr("disabled", true);
                spacing_struc_plane.attr("disabled", true);
            } else {
                //解冻下级变量
                num_struc_plane.attr("disabled", false);
                spacing_struc_plane.attr("disabled", false);
            }
        } else {
            //冻结上级变量
            completeness.val("false");
            completeness.attr("disabled", true);
            //冻结下级变量
            num_struc_plane.attr("disabled", true);
            spacing_struc_plane.attr("disabled", true);
        }

    })
    // K1行为
    K1.change(function () {
        if (K1.val() === "") {
            // 解冻组内变量
            $("#p,#Q,#mositure_content").attr("disabled", false);
        } else {
            // 冻结组内变量
            $("#p,#Q,#mositure_content").attr("disabled", true);
        }
        change_panel_3()
    });
    // p, Q行为
    $("#p,#Q").change(function () {
        if (p.val() === "" && Q.val() === "") {
            // 清空上级变量
            K1.val("");
            // 解冻组内变量
            $("#K1,#mositure_content").attr("disabled", false);
        } else if (p.val() !== "" && Q.val() !== "" && fc.val() !== "") {
            // 计算上级变量
            var table_k1 = [[0, 0, 0.05, 0.25, 0.5], [0.05, 0.15, 0.25, 0.5, 0.8], [0.15, 0.25, 0.5, 0.8, 1]];
            var index = 0;
            if (Q.val() > 125) {
                index = 3;
            } else if (Q >= 25) {
                index = 2;
            } else {
                index = 1;
            }
            K1.val(table_k1[index - 1][fir_quan - 1])
            // 冻结组内变量
            $("#K1,#mositure_content").attr("disabled", true);
        } else {
            // 冻结组内变量
            // 清空上级变量
            K1.val("");
            $("#K1,#mositure_content").attr("disabled", true);
        }
        change_panel_3()
    })
    // mositure_content行为:
    mositure_content.change(function () {
        if (mositure_content.val() === "") {
            // 清空上级变量
            K1.val("");
            // 解冻组内变量
            $("#K1,#p,#Q").attr("disabled", false);
        } else {
            // 计算上级变量
            K1.val("0.25");
            // 冻结组内变量
            $("#K1,#p,#Q").attr("disabled", true);
        }
        change_panel_3()
    })
    // K2行为:
    K2.change(function () {
        if (K2.val() === "") {
            // 解冻组内变量
            $("#included_angle,#dip_angle").attr("disabled", false);
        } else {
            // 冻结组内变量
            $("#included_angle,#dip_angle").attr("disabled", true);
        }
        change_panel_3()
    })
    // included_angle, dip_angle行为:
    $("#included_angle,#dip_angle").change(function () {
        if (included_angle.val() === "" && dip_angle.val() === "") {
            // 清空上级变量
            K2.val("");
            // 解冻组内变量
            K2.attr("disabled", false);
        } else if (included_angle.val() !== "" && dip_angle.val() !== "") {
            // 计算上级变量
            if (included_angle.val() < 30 && dip_angle.val() < 75) {
                K2.val(0.5);
            } else if (included_angle.val() > 60 && dip_angle.val() > 75) {
                K2.val(0.1);
            } else {
                K2.val(0.3);
            }
            // 冻结组内变量
            K2.attr("disabled", true);
        } else {
            // 冻结组内变量
            // 清空上级变量
            K2.val("");
            K2.attr("disabled", true);
        }
        change_panel_3()
    })
    // K3行为:
    K3.change(function () {
        if (K3.val() === "") {// 解冻组内变量
            sigma_max.attr("disabled", false);
        } else {// 冻结组内变量
            sigma_max.attr("disabled", true);
        }
        change_panel_3()
    })
    // sigma_max行为:
    sigma_max.change(function () {
        if (sigma_max.val() === "") {
            // 清空上级变量
            K3.val("");
            // 解冻组内变量
            K3.attr("disabled", false);
        } else if (Rc.val() === "" || fc.val() === "") {
            // 冻结组内变量
            K3.attr("disabled", true);
        } else {
            // 计算上级变量
            var stress_state = 0;
            if (Rc.val() / sigma_max.val() > 7) {
                stress_state = 1;
            } else if (Rc.val() / sigma + max.val() > 4) {
                stress_state = 2;
            } else {
                stress_state = 3;
            }
            var table_k3 = [[0, 0, 0, 0, 0], [1, 1, 1.25, 1.25, 1], [0.5, 0.5, 0.5, 0.75, 0.75]];
            K3.val(table_k3[stress_state - 1][fc.val() - 1]);
            // 冻结组内变量
            K3.attr("disabled", true);
        }
        change_panel_3()
    })
    submit.click(function () {
        //首先将分级结果面板, 衬砌参数面板, 警告面板置空
        $("#final,#bq,#fir_quan,#fir_qua,#cor_bq").text("-")
        //然后监测两个面板(而不是三个面板)的情况,显示警告信息, 计算或者提示无法计算
        $("#warninglist").text("无")
        if (panel_2_state === "danger") {
            //这个就直接无法分级
            alert("RC或Is未填,分级无法进行");
        } else {
            //首先建立警告列表
            var warning_list = [];
            if (panel_2_state === "success") {
                // 说明初步分级不存在问题
                // 显示初步分级的所有中间参数
                $("#bq").text(bq);
                $("#fir_quan").text(fir_quan);
                $("#fir_qua").text(fir_qua);
                if (panel_3_state === "warning") {
                    // 说明只能进行初步分级, 无法进行分级修正
                    warning_list.push("K1, K2或K3未填, 围岩稳定性修正无法进行.");
                    // 直接将初步分级的结果作为最终结果
                    $("#final").text(fir_quan);
                } else {
                    // 说明分级修正不存在问题
                    // 进行分级修正
                    correction(bq);
                    // 显示分级修正的结果, 并将分级修正的结果作为最终结果
                    $("#cor-bq").text(cor_bq);
                    $("#final").text(sec_quan);
                }
            } else if (panel_2_state === "warning") {
                // 说明初步分级只能进行定量部分
                // 显示初步分级定量部分的所有参数
                $("#bq").text(bq);
                $("#fir_quan").text(fir_quan)
                warning_list.push("岩石坚硬程度或完整程度未填, 围岩初步分级只能进行定量部分.");
                if (panel_3_state === "warning") {
                    warning_list.push("K1, K2或K3未填, 围岩稳定性修正无法进行.");
                    // 说明只能进行初步分级, 无法进行分级修正
                    // 直接将初步分级的结果作为最终结果
                    $("#final").text(fir_quan)
                } else {
                    // 说明分级修正不存在问题
                    // 进行分级修正
                    correction(bq);
                    // 显示分级修正的结果, 并将分级修正的结果作为最终结果
                    $("#cor-bq").text(cor_bq);
                    $("#final").text(sec_quan);
                }
            }
            //显示warninglist
            $("#warninglist").text(warning_list);
        }
        //然后显示警告信息, 或者直接提示无法计算
        //然后计算
    })
})



