include $(TOPDIR)/rules.mk

PKG_NAME:=xnnpack
PKG_VERSION:=d7f398ee5e135ef4f7045802eea973cc6cb26c6c
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/google/XNNPACK/tar.gz/$(PKG_VERSION)?
PKG_HASH:=0ed35a104a697abbae72b02b967e057883ff57b388178649c453b68cffb81f72
PKG_BUILD_DIR:=$(BUILD_DIR)/XNNPACK-$(PKG_VERSION)

PKG_LICENSE:=BSD-3-Clause
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1
PKG_BUILD_PARALLEL:=1

TARGET_CFLAGS += -Wno-error=incompatible-pointer-types

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/xnnpack
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Optimized neural network inference operators
  URL:=https://github.com/google/XNNPACK
  DEPENDS:=+cpuinfo +fp16 +fxdiv +pthreadpool +libpthread +libstdcpp
endef

CMAKE_OPTIONS += \
	-DCPUINFO_SOURCE_DIR=$(STAGING_DIR)/usr \
	-DCMAKE_POSITION_INDEPENDENT_CODE=ON \
	-DXNNPACK_BUILD_TESTS=OFF \
	-DXNNPACK_BUILD_BENCHMARKS=OFF \
	-DXNNPACK_ENABLE_KLEIDIAI=OFF \
	-DXNNPACK_USE_SYSTEM_LIBS=ON

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

define Package/xnnpack/install
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_INSTALL_DIR)/usr/lib/libXNNPACK.so* $(1)/usr/lib/ 2>/dev/null || true
endef

$(eval $(call BuildPackage,xnnpack))
