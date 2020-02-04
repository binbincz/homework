//2.***.html中放入内容，用html格式仅仅因为会有编辑器的书写辅助。。
//3.代码：

            $(".include").each(function() {
                if (!!$(this).attr("file")) {
                    var $includeObj = $(this);
                    $(this).load($(this).attr("file"), function(html) {
                        $includeObj.after(html).remove(); //加载的文件内容写入到当前标签后面并移除当前标签
                    })
                }
            });