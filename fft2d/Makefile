include $(TOPDIR)/rules.mk

PKG_NAME:=fft2d
PKG_VERSION:=2006.12.28
PKG_RELEASE:=1

PKG_SOURCE:=fft2d.tgz
PKG_SOURCE_URL:=https://www.kurims.kyoto-u.ac.jp/~ooura
PKG_HASH:=ada7e99087c4ed477bfdf11413f2ba8db8a840ba9bbf8ac94f4f3972e2a7cec9
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

PKG_LICENSE:=MIT-like
PKG_LICENSE_FILES:=readme2d.txt

include $(INCLUDE_DIR)/package.mk

define Package/fft2d
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=2D/3D FFT source package
  URL:=https://www.kurims.kyoto-u.ac.jp/~ooura/fft.html
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	gzip -dc $(DL_DIR)/$(PKG_SOURCE) | tar -C $(PKG_BUILD_DIR) -xf -
endef

define Build/Compile
endef

define Build/InstallDev
	$(INSTALL_DIR) $(1)/usr/include/fft2d
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/fft2d/*.c $(1)/usr/include/fft2d/
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/fft2d/*.f $(1)/usr/include/fft2d/
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/fft2d/*.h $(1)/usr/include/fft2d/
endef

$(eval $(call BuildPackage,fft2d))
