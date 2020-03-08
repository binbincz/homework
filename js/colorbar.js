 // 原理画线  画出点，构成线，然后由多根线组成图案
(function (window) {
        var ctx,
            hue,
            form,
            buffer,
            target = {},
            tendrils = [],
            settings = {};

        //摩擦力
        settings.friction = 0.5;
        //轨迹条数
        settings.trails = 50;
        //轨迹长度 点的个数
        settings.size = 50;
        // 阻尼  影响线收敛的快慢  越大越快
        settings.dampening =0.1;
        // 张力
        settings.tension = 0.98;

        Math.TWO_PI = Math.PI * 2;


        function Oscillator(options) {
            this.init(options || {});
        }
        //振荡器   向对象添加属性和方法
        Oscillator.prototype = (function () {

            var value = 0;

            return {

                init: function (options) {
                    this.phase = options.phase || 0;
                    this.offset = options.offset || 0;
                    this.frequency = options.frequency || 0.001;
                    this.amplitude = options.amplitude || 1;
                },

                update: function () {
                    this.phase += this.frequency;
                    value = this.offset + Math.sin(this.phase) * this.amplitude;
                    return value;
                },

                value: function () {
                    return value;
                }
            };

        })();

        // ========================================================================================
        // ----------------------------------------------------------------------------------------

        function Tendril(options) {
            this.init(options || {});
        }
        //卷须  曲线  原理画线
        Tendril.prototype = (function () {

            function Node() {
                this.x = 0;
                this.y = 0;
                this.vy = 0;
                this.vx = 0;
            }

            return {

                init: function (options) {
                    // 弹簧
                    this.spring = options.spring + (Math.random() * 0.1) - 0.05;
                    //摩擦力
                     this.friction = settings.friction + (Math.random() * 0.01) - 0.005;
                    this.nodes = [];

                    for (var i = 0, node; i < settings.size; i++) {

                        node = new Node();
                        node.x = target.x;
                        node.y = target.y;

                        this.nodes.push(node);
                    }
                },

                update: function () {

                    var spring = this.spring,
                        node = this.nodes[0];

                    node.vx += (target.x - node.x) * spring;
                    node.vy += (target.y - node.y) * spring;

                    for (var prev, i = 0, n = this.nodes.length; i < n; i++) {

                        node = this.nodes[i];

                        if (i > 0) {
                            prev = this.nodes[i - 1];
                            node.vx += (prev.x - node.x) * spring;
                            node.vy += (prev.y - node.y) * spring;
                            node.vx += prev.vx * settings.dampening;
                            node.vy += prev.vy * settings.dampening;
                        }

                        node.vx *= this.friction;
                        node.vy *= this.friction;
                        node.x += node.vx;
                        node.y += node.vy;

                        spring *= settings.tension;
                    }
                },

                draw: function () {

                    var x = this.nodes[0].x,
                        y = this.nodes[0].y,
                        a, b;

                    ctx.beginPath();
                    ctx.moveTo(x, y);

                    for (var i = 1, n = this.nodes.length-2; i < n; i++) {

                        a = this.nodes[i];
                        b = this.nodes[i + 1];
                        x = (a.x + b.x) * 0.5;
                        y = (a.y + b.y) * 0.5;
                        // 绘制一条二次贝塞尔曲线：
                        ctx.quadraticCurveTo(a.x, a.y, x, y);
                    }
                    // 绘制出通过 moveTo() 和 quadraticCurveTo() 方法定义的路
                    ctx.stroke();
                    ctx.closePath();
                }
            };

        })();

        // ----------------------------------------------------------------------------------------

        function init(event) {

            document.removeEventListener('mousemove', init);
            document.removeEventListener('touchstart', init);
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('touchmove', mousemove);
            document.addEventListener('touchstart', touchstart);

            mousemove(event);
            reset();
            loop();
        }

        //卷须初始化
        function reset() {

            tendrils = [];

            for (var i = 0; i < settings.trails; i++) {

                tendrils.push(new Tendril({
                    spring: 0.45 + 0.025 * (i / settings.trails)
                }));
            }
        }

        function loop() {

            if (!ctx.running) return;

            ctx.globalCompositeOperation = 'source-over';
            //填充颜色 和透明度
            ctx.fillStyle = 'rgba(8,5,16,0.4)';
            //绘制"已填充"的矩形
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.globalCompositeOperation = 'lighter';
            //控制彩带颜色  色相、饱和度、亮度、透明度
            ctx.strokeStyle = 'hsla(' + Math.round(hue.update()) + ',90%,50%,0.25)';
             // ctx.strokeStyle = 'hsla(120,90%,50%,0.25)';
            //线条宽度 1个像素
            ctx.lineWidth = 1;

            for (var i = 0, tendril; i < settings.trails; i++) {
                tendril = tendrils[i];
                tendril.update();
                tendril.draw();
            }

            ctx.frame++;
            requestAnimFrame(loop);
        }

        function resize() {
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;
        }

        function start() {
            if (!ctx.running) {
                ctx.running = true;
                loop();
            }
        }

        function stop() {
            ctx.running = false;
        }
        //适用PC 获取位置
        function mousemove(event) {
            if (event.touches) {
                target.x = event.touches[0].pageX;
                target.y = event.touches[0].pageY;
            } else {
                target.x = event.clientX
                target.y = event.clientY;
            }
            event.preventDefault();
        }
        //适用手机触摸屏 获取位置
        function touchstart(event) {
            if (event.touches.length == 1) {
                target.x = event.touches[0].pageX;
                target.y = event.touches[0].pageY;
            }
        }

      // requestAnimFrame 是浏览器用于定时循环操作的一个接口，类似于setTimeout，主要用途是按帧对网页进行重绘
        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (fn) {
                window.setTimeout(fn, 1000/60 )   //定义每秒执行60次动画
            };
        })();


         /*字的动态显示*/
        function letters(id) {

            var el = document.getElementById(id),
                letters = el.innerHTML.replace('&amp;', '&').split(''),
                heading = '';

            for (var i = 0, n = letters.length, letter; i < n; i++) {
                letter = letters[i].replace('&', '&amp');
                heading += letter.trim() ? '<span class="letter-' + i + '">' + letter + '</span>' : '&nbsp;';
            }

            el.innerHTML = heading;
            setTimeout(function () {
                el.className = 'transition-in';
            }, (Math.random() * 500) + 500);
        };

        //代码开始执行的地方
        window.onload = function () {

            ctx = document.getElementById('canvas').getContext('2d');
            ctx.running = true;
            ctx.frame = 1;
            // 振荡器
            hue = new Oscillator({
                phase: Math.random() * Math.TWO_PI,
                amplitude: 85,
                frequency: 0.015,
                offset: 285
            });

            document.addEventListener('mousemove', init);
            document.addEventListener('touchstart', init);
            document.body.addEventListener('orientationchange', resize);
            window.addEventListener('resize', resize);
            window.addEventListener('focus', start);
            window.addEventListener('blur', stop);

            resize();

            letters('h1');
            letters('h2');
            letters('h3');
            letters('h4');
            letters('h5');
        };

    })(window);
