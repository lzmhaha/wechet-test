import { WxTool } from "./wx-tool";

declare let wx: any;

const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    btnLogin: cc.Node = null;

    @property(cc.Node)
    btnGetAuthorize: cc.Node = null;

    @property(cc.Node)
    btnGetUserInfo: cc.Node = null;

    @property(cc.Node)
    btnGetWerunData: cc.Node = null;

    @property(cc.Node)
    btnShare: cc.Node = null;

    @property(cc.Node)
    btnGetShareInfo: cc.Node = null;

    @property(cc.Sprite)
    head: cc.Sprite = null;

    @property(cc.Label)
    lbName: cc.Label = null;

    private _userInfo: any;

    protected onLoad () {
        this.btnLogin.on('click', this._onBtnLoginClick, this);
        this.btnGetAuthorize.on('click', this._onBtnGetAuthorize, this);
        this.btnGetUserInfo.on('click', this._onBtnGetUserInfoClick, this);
        this.btnGetWerunData.on('click', this._onBtnGetWerunData, this);
        this.btnShare.on('click', this._onBtnShareClick, this);
        this.btnGetShareInfo.on('click', this._onBtnGetShareInfo, this);

        WxTool.setOnShowCall(function(scene, query, shareTicket, referrerInfo) {
            cc.log(query);
        });
    }

    protected start(): void {
        this._showShareMenu();
    }

    protected onDestroy(): void {
        this.btnLogin.targetOff(this);
        this.btnGetAuthorize.targetOff(this);
        this.btnGetUserInfo.targetOff(this);
        this.btnGetWerunData.targetOff(this);
        this.btnShare.targetOff(this);
    }

    private _showUserInfo(): void {
        if(!this._userInfo) {
            cc.log('没有用户信息');
            return;
        }
        this.lbName.string = this._userInfo.nickName;
        // 显示头像
        let avatarUrl = this._userInfo.avatarUrl;
        let image = wx.createImage();
        image.onload = () => {
            let texture = new cc.Texture2D();
            texture.initWithElement(image);
            texture.handleLoadedTexture();
            this.head.spriteFrame = new cc.SpriteFrame(texture);
        };
        image.src = avatarUrl;
    }

    protected _onBtnLoginClick(): void {
        if(CC_WECHATGAME) {
            wx.login({
                success: (...arg) => {
                    cc.log('login success');
                    cc.log(arg);
                },
                fail: (...arg) => {
                    cc.log('login fail');
                    cc.log(arg);
                }
            })
        } else {
            cc.log('not in wechat platform');
        }
        
    }

    protected _onBtnGetAuthorize(): void {
        if(!CC_WECHATGAME) {
            cc.warn('not in wechat platform');
            return;
        }
        wx.getSetting({
            success: (res) => {
                cc.log('success');
                cc.log(res);
            },
            fail: (res) => {
                cc.log('fail');
            },
        })
    }

    protected _onBtnGetUserInfoClick(): void {
        if(!CC_WECHATGAME) {
            cc.warn('not in wechat platform');
            return;
        }

        let getUserInfoCall = wx.getUserInfo.bind(this, {
            success: (res) => {
                cc.log('获取用户信息成功');
                cc.log(res);
                this._userInfo = res.userInfo;
                this._showUserInfo();
            },
            fail: (...arg) => {
                cc.log('获取用户信息失败');
                cc.log(arg);
            },
        })

        wx.getSetting({
            success: (res) => {
                cc.log('set setting success');
                if(res.authSetting['scope.userInfo']) {
                    getUserInfoCall();
                } else {
                    wx.authorize({
                        scope: 'scope.userInfo',
                        success: () => {
                            cc.log('授权成功')
                            getUserInfoCall();
                        },
                        fail: () => {
                            cc.warn('授权失败，尝试打开权限界面');
                            wx.openSetting({
                                success: (res) => {
                                    cc.log('打开权限界面成功')
                                    if(res.authSetting['scope.userInfo']) {
                                        cc.log('授权成功');
                                        getUserInfoCall();
                                    } else {
                                        cc.warn('授权失败');
                                    }
                                },
                                fail: () => {
                                    cc.log('打开权限界面失败');
                                }
                            })
                        }
                    })
                }
            },
            fail: (...arg) => {
                cc.log('getSetting fail');
                cc.log(arg);
            },
        })
    }

    private _onBtnGetWerunData(): void {
        WxTool.getAuthorize('scope.werun', function(success) {
            if(success) {
                wx.getWeRunData({
                    success: function(res): void {
                        cc.log('获取微信运动步数成功');
                        cc.log(res);
                    },
                    fail: function(res): void {
                        cc.log('获取微信运动步数失败')
                    }
                });
            } else{
                cc.warn('没有权限, 获取微信运动步数失败')
            }
        });
    }

    private _onBtnShareClick(): void {
        WxTool.share(this._userInfo && this._userInfo.avatarUrl || '', '分享测试', {roomId: 10086, password: 'asdfgh'});
    }

    private _onBtnGetShareInfo(): void {
        let res = wx.getLaunchOptionsSync();
        cc.log(res);
    }

    // -------------------------------------------------------
    private _showShareMenu(): void {
        if(!CC_WECHATGAME) return;
        wx.showShareMenu({
            withShareTicket: true,
            success: (res) => {
                cc.log('显示分享按钮成功');
                cc.log(res);
            },
            fail: (res) => {
                cc.log('显示分享按钮失败');
                cc.log(res);
            }
        })
    }
}
