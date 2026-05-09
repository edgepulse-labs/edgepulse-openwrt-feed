include $(TOPDIR)/rules.mk

PKG_NAME:=gemmlowp
PKG_VERSION:=16e8662c34917be0065110bfcd9cc27d30f52fdf
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/google/gemmlowp/tar.gz/$(PKG_VERSION)?
PKG_HASH:=c3feb896a1b42595cf9a508ed64ed0dc3cd84fffdb8eed790d02d0534ab322ce

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/gemmlowp
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Low-precision matrix multiplication
  URL:=https://github.com/google/gemmlowp
  DEPENDS:=+libstdcpp
endef

CMAKE_SOURCE_SUBDIR:=contrib

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

$(eval $(call BuildPackage,gemmlowp))
