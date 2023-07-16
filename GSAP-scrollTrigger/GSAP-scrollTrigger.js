// gsap.fromTo("元素","起始狀態","結束狀態")
// gsap.fromTo("元素",{},{})
const img = document.querySelector('.setting')
gsap.registerPlugin(ScrollTrigger);//透過registerPlugin方法將scrollTrigger插件引入
gsap.fromTo(
    img,
    {
        x: 0
    },
    {
        x: function (_, target) {
            return document.documentElement.clientWidth - target.offsetWidth;
        },
        //轉動方向
        rotation: function (_, target) {
            const r = target.offsetWidth / 2;//元素的半徑
            const long = 2 * Math.PI * r; //周長
            return (document.documentElement.clientWidth - target.offsetWidth - target.offsetWidth) / long * 360
        },//加上選轉
        duration: 10,//控制動畫時常
        ease: "none", //控制動畫樣式https://greensock.com/docs/v3/Eases
        scrollTrigger: {
            trigger: img, //觸發器 表示觸發的Obj
            scrub: true, //表示動畫 跟scroll進行關聯
            start: 'center center',//設定起始位置
            pin: true,//把obj定住
        }
    }
);
