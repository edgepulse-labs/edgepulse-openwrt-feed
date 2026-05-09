include $(TOPDIR)/rules.mk

PKG_NAME:=cpuinfo
PKG_VERSION:=8a1772a0c5c447df2d18edf33ec4603a8c9c04a6
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/pytorch/cpuinfo/tar.gz/$(PKG_VERSION)?
PKG_HASH:=37bb2fd2d1e87102baea8d131a0c550c4ceff5a12fba61faeb1bff63868155f1

PKG_LICENSE:=BSD-2-Clause
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/cpuinfo
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=CPU information library
  URL:=https://github.com/pytorch/cpuinfo
  DEPENDS:=+libpthread
endef

define Package/cpuinfo/description
 CPU INFOrmation library for detecting CPU features used by performance-sensitive code.
endef

CMAKE_OPTIONS += \
	-DCMAKE_POSITION_INDEPENDENT_CODE=ON \
	-DCPUINFO_BUILD_UNIT_TESTS=OFF \
	-DCPUINFO_BUILD_MOCK_TESTS=OFF \
	-DCPUINFO_BUILD_BENCHMARKS=OFF

TARGET_CFLAGS += $(FPIC)

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

define Package/cpuinfo/install
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_INSTALL_DIR)/usr/lib/libcpuinfo.so* $(1)/usr/lib/ 2>/dev/null || true
endef

$(eval $(call BuildPackage,cpuinfo))
