package com.tencent.wxcloudrun.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PerformanceMonitor {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceMonitor.class);

    @Pointcut("execution(* com.tencent.wxcloudrun.controller..*(..))")
    public void controllerMethods() {}

    @Around("controllerMethods()")
    public Object profile(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        String className = pjp.getTarget().getClass().getSimpleName();
        String methodName = pjp.getSignature().getName();
        
        try {
            Object output = pjp.proceed();
            long elapsedTime = System.currentTimeMillis() - start;
            if (elapsedTime > 500) {
                logger.warn("Method execution longer than 500ms! {}.{} took {}ms", className, methodName, elapsedTime);
            } else {
                logger.info("{}.{} execution time: {}ms", className, methodName, elapsedTime);
            }
            return output;
        } catch (Throwable e) {
            long elapsedTime = System.currentTimeMillis() - start;
            logger.error("{}.{} failed in {}ms with exception: {}", className, methodName, elapsedTime, e.getMessage());
            throw e;
        }
    }
}
