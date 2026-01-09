package com.tencent.wxcloudrun.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 获取当前工作目录
        String currentPath = System.getProperty("user.dir");
        // 映射 /uploads/** 到本地文件系统
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + currentPath + File.separator + "uploads" + File.separator);
    }
}
